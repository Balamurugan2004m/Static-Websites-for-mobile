// UI Components
export { LoadingSpinner } from './loading-spinner';
export { Button } from './button';
export { Card, CardHeader, CardContent, CardActions } from './card';
export { Input, EmailInput, PasswordInput, SearchInput } from './input';
export { CharacterCountInput } from './character-count-input';
export { ReadonlyField } from './readonlyFiled';
export { SelectField } from './select';
export { ActionButton } from './action-button';
export { SectionHeader } from './section-header';

export { default as PageTitleChip } from './page-title-chip';
// export { Modal, AlertModal } from './modal';
export { default as ConfirmationModal } from './confirmation-modal';
export { default as AlertDialog } from './alert-dialog';
export { default as ReasonConfirmDialog } from './reason-confirm-dialog';
export { default as FormFieldLabel } from './form-field-label';
export { default as ExpandChevron } from './expand-chevron';
export { default as ExpandToggleButton } from './expand-toggle-button';
export { default as CollapsibleSection } from './collapsible-section';
export { default as FacilitySearchSelect } from './facility-search-select';
export {
    DrawerSelectField,
    DrawerMultilineField,
    useDrawerDateTimeFieldSx,
} from './drawer-form-fields';
export {
    getDrawerFieldSx,
    getDrawerFieldPalette,
    type DrawerFieldPalette,
} from './drawer-field-styles';
export { getDialogThemeColors, getDialogLayout } from './dialog-theme';
export { CommonDialog } from './dialog';
export { CommonTabs } from './tabs';

// Re-export commonly used MUI components for convenience
export {
  Box,
  Typography,
  Grid,
  Container,
  Paper,
  Divider,
  Chip,
  Avatar,
  Badge,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';

// Re-export commonly used MUI icons
export {
  Home,
  Settings,
  Person,
  Search,
  Add,
  Edit,
  Delete,
  Close,
  Check,
  Warning,
  Info,
  Error,
  Visibility,
  VisibilityOff,
  KeyboardArrowDown,
  KeyboardArrowUp,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
