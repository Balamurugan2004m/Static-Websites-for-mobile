import { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    CircularProgress,
    Link as MuiLink,
    InputAdornment,
    useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { paths } from '../../constants/paths';
import PublicLayout from '../../layouts/public-layout/public-layout';
import { requestPasswordReset } from '../../services/auth';
import TextInput from '../../ui/text-input';
import ResetEmail from '../../assets/reset-email.svg';
import { THEME_PRIMITIVES } from '../../theme';
import WarningIcon from "../../assets/warning-icon.svg";
 
import AuthCard, {
  AuthCardHeader,
  AuthCardBody,
  AuthCardFooter,
} from "../../components/auth/auth-card";
import AlertBanner from "../../ui/alert-banner";
 
const ForgotPassword: React.FC = () => {
    const theme = useTheme();
    const P = THEME_PRIMITIVES;
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successPopup, setSuccessPopup] = useState({
        open: false,
        email: '',
    });

    const handleGetPassword = async () => {
        if (loading) return;
        if (!username.trim()) {
            setError('*Required field');
            return;
        }

        setLoading(true);
        try {
            await requestPasswordReset(username);
 
                setSuccessPopup({
                    open: true,
        email: "",
                });
        } catch (error) {
      setError("Invalid username. Please try again!");
            console.error('Forgot password request failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClosePopup = () => {
        setSuccessPopup({
            open: false,
            email: '',
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        if (error) setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleGetPassword();
    };

    return (
        <PublicLayout>
 <Box
  sx={{
    width: "100%",
    height: "100%",
    display: "flex",
    fontFamily: theme.typography.fontFamily,
  }}
>
{!successPopup.open && (
  <AuthCard>
          <AuthCardHeader />
 
          <AuthCardBody spacing={0}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                width: { xs: "100%", sm: "345px", md: "345px", lg: "345px", xl: "345px" },
                maxWidth: "345px",
                mx: "auto",
              }}
            >
              {error && (
                <AlertBanner
                  severity="error"
                  message={
                    error === "*Required field"
                      ? "Please enter your username."
                      : error
                  }
                        />
              )}
              <Typography
                variant="inherit"
                sx={(theme) => ({
                  fontWeight: 400,
                  mt:1.5,
                  fontSize: "24px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: P.black,
                  fontFamily: theme.custom?.typeScale.openSans,
                })}
                  >
                Reset Password
              </Typography>
 
                        <Typography
                            variant="inherit"
                            component="p"
                            sx={(theme) => ({
                                fontWeight: 400,
                                fontSize: '14px',
                                lineHeight: "20px",
                                color: P.textSecondary,
                                mb: "24px",
                                display: "block",
                                width: { xs: "100%", sm: "345px", md: "345px", lg: "345px", xl: "345px" },
                                maxWidth: "345px",
                                fontFamily: theme.custom?.typeScale.openSans,
                            })}
                        >
                            Enter your username and we'll send you a link to reset your
                            password.
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: { xs: "100%", sm: "345px", md: "345px", lg: "345px", xl: "345px" },
                            maxWidth: "345px",
                        }}>
                            <TextInput
                                id="username"
                                name="username"
                                label="Username"
                                value={username}
                                onChange={handleInputChange}
                                error={!!error}
                                autoComplete="off"
                                height="45px"
                                endAdornment={
                                    error ? (
                                        <InputAdornment position="end">
                                          <Box
                                            component="img"
                                            src={WarningIcon}
                                            alt="Warning"
                                            sx={{
                                              width: 18,
                                              height: 18,
                                            }}
                                            />
                                        </InputAdornment>
                                    ) : null
                                }
                            />
                            {error === "*Required field" && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "#700000",
                                        fontWeight: 400,
                                        fontSize: "10px",
                                        mt: 0.5,
                                        ml: 2.5,
                                      fontFamily: theme.custom?.typeScale.openSans,
                                    }}
                                >
                                 *Required field
                                </Typography>
                            )}
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={(theme) => ({
                                width: { xs: "100%", sm: "345px", md: "345px", lg: "345px", xl: "345px" },
                                maxWidth: "345px",
                                minWidth: { sm: "345px", md: "345px", lg: "345px", xl: "345px" },
                                height: "45px",
                                minHeight: "45px",
                                maxHeight: "45px",
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontSize: '14px',
                                fontWeight: 400,
                                backgroundColor: theme.palette.primary.main,
                                mt: '18px',
                                '&:hover': {
                                    backgroundColor: P.buttonHover,
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: P.buttonDisabled,
                                    color: P.white,
                                },
                            })}
                            startIcon={
                                loading ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : null
                            }
                        >
                            {loading ? 'Sending reset link...' : 'Reset link'}
                        </Button>

                        <MuiLink
                            onClick={() => navigate(paths.LOGIN.pathName)}
                            sx={(theme) => ({
                                color: P.black,
                                cursor: 'pointer',
                                fontSize: '12px',
                                textAlign: 'center',
                                fontWeight: 400,
                                lineHeight: '100%',
                                letterSpacing: '0%',
                                textDecoration: 'underline',
                                textUnderlineOffset: '2px',
                                textDecorationColor: theme.palette.text.primary,
                                mt: '14px',
                                 fontFamily: theme.custom?.typeScale.openSans,
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            })}
                        >
                            Back to login
                        </MuiLink>
 
                    </Box>
          </AuthCardBody>
 
              <AuthCardFooter />
          </AuthCard>
)}
                <Dialog
                    open={successPopup.open}
                    onClose={handleClosePopup}
                    slotProps={{
                        backdrop: {
                            sx: { backgroundColor: P.modalBackdropMedium},
                        },
                        paper: {
                            sx: {
                                width: '994px',
                                maxWidth: '95vw',
                                borderRadius: '10px',
                                overflow: 'hidden',
                            },
                        },
                    }}
                >
                    {/* <Box
                        sx={(theme) => ({
                            height: '111px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            borderBottom: `1px solid ${theme.custom?.colors.stroke}`,
                            backgroundColor: theme.palette.background.paper,
                        })}
                    >
                        <Box
                            component="img"
                            src={ResetEmail}
                            alt="Email confirmation"
                            sx={{ width: 32, height: 32 }}
                        />
                        <Typography
                            variant="inherit"
                            sx={(theme) => ({
                                fontWeight: 700,
                                fontSize: '32px',
                                lineHeight: '45px',
                                color: theme.palette.primary.main,
                                fontFamily: theme.custom?.typeScale.openSans,
                            })}
                        >
                            Check your email
                        </Typography>
                    </Box> */}

<AuthCardHeader
  sx={{
    height: "111px",
    borderTopLeftRadius: "15px",
    borderTopRightRadius: "15px",
  }}
/>
<Box
  sx={{
    display: "flex",
    justifyContent: "center",
    mt: "28px",
  }}
>
  <Box
    sx={{
      width: 56,
      height: 56,
      borderRadius: "50%",
      backgroundColor: "#2447941A", // 10% opacity
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Box
      component="img"
      src={ResetEmail}
      alt="Email"
      sx={{
        width: 26,
        height: 17,
        ml: "3.5px",
      }}
    />
  </Box>
</Box>
<Typography
  sx={{
    textAlign: "center",
    mt: "16px",
    fontWeight: 700,
    fontSize: "18p !important",
    color: "#000",
  }}
>
  Check your email
</Typography>
                    <Box
                        sx={(theme) => ({
                            flex: 1,
                            px: '61px',
                            pt: '18px',
                            pb: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: theme.palette.background.paper,
                        })}
                    >
                        <Typography
                            variant="inherit"
                            component="p"
                            sx={(theme) => ({
                                fontWeight: 400,
                                fontSize: "14px",
                                lineHeight: "30px",
                                letterSpacing: "0%",
                                color: theme.palette.text.primary,
                                m: 0,
                                fontFamily: theme.custom?.typeScale.openSans,
                            })}
                        >
                            Please click on the link in the email to reset your
                            password. Didn’t receive the password reset message? Here
                            are a few things to try:
                        </Typography>

                        <Box
                            component="ul"
                            sx={(theme) => ({
                                listStyleType: 'disc',
                                pl: '24px',
                                my: 0,
                                '& li': {
                                    fontSize: "14px",
                                    lineHeight: "15px",
                                    fontWeight: 400,
                                    letterSpacing: "0%",
                                    marginBottom: "18px",
                                    mt: "12px",
                                    color: theme.palette.text.primary,
                                    fontFamily: theme.custom?.typeScale.openSans,
                                },
                            })}
                        >
                            <li>
                                Check your spam folder for an email from{' '}
                                <Box component="span" sx={{ fontWeight: 700 }}>
                                    no-reply@lsgs.loyalhealthcare.com
                                </Box>
                                .
                            </li>
                            <li>
                                Review your User ID and make sure it was entered
                                correctly.
                            </li>
                            <li>
                                Please contact us at (833) 832-7077, 6:00am-12:00am
                                Central Time, Monday through Saturday.
                            </li>
                        </Box>

                        <Typography
                            variant="inherit"
                            component="p"
                            sx={(theme) => ({
                                fontSize: "14px",
                                lineHeight: "25px",
                                fontWeight: 400,
                                letterSpacing: "0%",
                                color: theme.palette.text.primary,
                                mt: "0px",
                                mb: 0,
                                fontFamily: theme.custom?.typeScale.openSans,
                            })}
                        >
                            If you have provided a valid Username, you will receive an
                            email to reset your password momentarily. If you do not
                            receive an email, please contact your system administration
                            for assistance.
                        </Typography>

                        <Box
                            sx={{
                                mt: 'auto',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: '24px',
                                pt: '24px',
                            }}
                        >
                          <Button
                            variant="contained"
                                onClick={() => {
                                    handleClosePopup();
                                    navigate(paths.LOGIN.pathName);
                                }}
                                sx={{
                                  width: "129px",
                                  height: "34px",
                                  borderRadius: "10px",
                                  textTransform: "none",
                                  fontSize: "14px",
                                  fontWeight: 400,
                                  backgroundColor: P.primary,
                                  fontFamily: theme.custom?.typeScale.openSans,
                                  "&:hover": {
                                    backgroundColor: P.primaryHover,
                                  },
                                }}
                            >
                                Back to login
                            </Button>
                        </Box>
                    </Box>
                </Dialog>
            </Box>
        </PublicLayout>
    );
};

export default ForgotPassword;
