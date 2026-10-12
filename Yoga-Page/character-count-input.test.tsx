import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharacterCountInput } from "./character-count-input";

describe("CharacterCountInput", () => {
  it("renders input field", () => {
    render(<CharacterCountInput placeholder="Type Name" />);
    expect(screen.getByPlaceholderText("Type Name")).toBeInTheDocument();
  });

  it("does not display character badge when blurred", () => {
    render(<CharacterCountInput placeholder="Type Name" maxLength={45} value="" />);
    expect(screen.queryByTestId("char-counter-badge")).not.toBeInTheDocument();
  });

  it("displays blue badge with initial count on focus", () => {
    render(<CharacterCountInput placeholder="Type Name" maxLength={45} value="" />);
    const input = screen.getByPlaceholderText("Type Name");
    fireEvent.focus(input);

    const badge = screen.getByTestId("char-counter-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("(Characters 0/45)");
    expect(badge).toHaveStyle({ backgroundColor: "#337ab7" });
  });

  it("updates character count on focus when value is pre-populated", () => {
    render(<CharacterCountInput placeholder="Type Name" maxLength={45} value="Hello" />);
    const input = screen.getByPlaceholderText("Type Name");
    fireEvent.focus(input);

    const badge = screen.getByTestId("char-counter-badge");
    expect(badge).toHaveTextContent("(Characters 5/45)");
    expect(badge).toHaveStyle({ backgroundColor: "#337ab7" });
  });

  it("turns red when character limit is reached", () => {
    const maxStr = "a".repeat(45);
    render(<CharacterCountInput placeholder="Type Name" maxLength={45} value={maxStr} />);
    const input = screen.getByPlaceholderText("Type Name");
    fireEvent.focus(input);

    const badge = screen.getByTestId("char-counter-badge");
    expect(badge).toHaveTextContent("(Characters 45/45)");
    expect(badge).toHaveStyle({ backgroundColor: "#d9534f" });
  });

  it("hides badge when input loses focus (on blur)", () => {
    render(<CharacterCountInput placeholder="Type Name" maxLength={45} value="Test" />);
    const input = screen.getByPlaceholderText("Type Name");
    fireEvent.focus(input);
    expect(screen.getByTestId("char-counter-badge")).toBeInTheDocument();

    fireEvent.blur(input);
    expect(screen.queryByTestId("char-counter-badge")).not.toBeInTheDocument();
  });

  it("clamps input value to maxLength on change", () => {
    let captured = "";
    const TestComponent = () => {
      const [val, setVal] = React.useState("");
      return (
        <CharacterCountInput
          placeholder="Type Name"
          maxLength={5}
          value={val}
          onChange={(e) => {
            captured = e.target.value;
            setVal(e.target.value);
          }}
        />
      );
    };
    render(<TestComponent />);
    const input = screen.getByPlaceholderText("Type Name");
    fireEvent.change(input, { target: { value: "123456789" } });

    expect(captured).toBe("12345");
  });

  it("filters non-digit characters when numericOnly is true", () => {
    let captured = "";
    const TestComponent = () => {
      const [val, setVal] = React.useState("");
      return (
        <CharacterCountInput
          placeholder="Phone"
          maxLength={10}
          numericOnly
          value={val}
          onChange={(e) => {
            captured = e.target.value;
            setVal(e.target.value);
          }}
        />
      );
    };
    render(<TestComponent />);
    const input = screen.getByPlaceholderText("Phone");
    fireEvent.change(input, { target: { value: "abc123xyz45" } });

    expect(captured).toBe("12345");
  });

  it("invokes external onFocus and onBlur handlers", () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    render(
      <CharacterCountInput
        placeholder="Type Name"
        maxLength={45}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
    const input = screen.getByPlaceholderText("Type Name");

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("sets type='number' on underlying input and blocks exponent and sign keys", () => {
    render(<CharacterCountInput placeholder="Number Field" type="number" maxLength={10} />);
    const input = screen.getByPlaceholderText("Number Field");
    expect(input).toHaveAttribute("type", "number");

    expect(fireEvent.keyDown(input, { key: "e" })).toBe(false);
    expect(fireEvent.keyDown(input, { key: "E" })).toBe(false);
    expect(fireEvent.keyDown(input, { key: "+" })).toBe(false);
    expect(fireEvent.keyDown(input, { key: "-" })).toBe(false);
    expect(fireEvent.keyDown(input, { key: "." })).toBe(false);
    expect(fireEvent.keyDown(input, { key: "5" })).toBe(true);
  });

  it("clamps input value to maxLength when type='number'", () => {
    let captured = "";
    const TestComponent = () => {
      const [val, setVal] = React.useState("");
      return (
        <CharacterCountInput
          placeholder="Number Field"
          type="number"
          maxLength={5}
          value={val}
          onChange={(e) => {
            captured = e.target.value;
            setVal(e.target.value);
          }}
        />
      );
    };
    render(<TestComponent />);
    const input = screen.getByPlaceholderText("Number Field");
    fireEvent.change(input, { target: { value: "12345678" } });

    expect(captured).toBe("12345");
  });

  it("renders helperText alongside character badge when focused without collision", () => {
    render(
      <CharacterCountInput
        placeholder="Field with Error"
        maxLength={3}
        value="999"
        helperText={<span data-testid="test-error">CMS rate percent must be between 0 and 100</span>}
      />
    );
    const input = screen.getByPlaceholderText("Field with Error");
    expect(screen.getByTestId("test-error")).toBeInTheDocument();
    expect(screen.queryByTestId("char-counter-badge")).not.toBeInTheDocument();

    fireEvent.focus(input);
    expect(screen.getByTestId("test-error")).toBeInTheDocument();
    const badge = screen.getByTestId("char-counter-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("(Characters 3/3)");
  });
});

