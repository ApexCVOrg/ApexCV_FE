'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Facebook,
  CheckCircle,
} from '@mui/icons-material';
import Image from 'next/image';

import { useAuth } from '@/hooks/useAuth';
import { API_ENDPOINTS } from '@/lib/constants/constants';

// Local storage keys for form data
const FORM_STORAGE_KEYS = {
  BASIC_INFO: 'register_basic_info',
  ADDRESS: 'register_address',
  CURRENT_STEP: 'register_current_step',
};

export default function RegisterPage() {
  const t = useTranslations('register');
  const router = useRouter();
  const pathname = usePathname();
  useAuth();
  const locale = pathname?.split('/')[1] || 'vi';

  // Form state
  const initialFormData = {
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      recipientName: '',
      street: '',
      city: '',
      state: '',
      country: '',
      addressNumber: '',
      isDefault: false,
    },
  };
  const [formData, setFormData] = useState(initialFormData);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step management
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60); // 60 giây = 1 phút
  const [otpExpired, setOtpExpired] = useState(false);

  // Load saved form data on component mount
  useEffect(() => {
    const loadSavedFormData = () => {
      try {
        // Load basic info
        const savedBasicInfo = localStorage.getItem(FORM_STORAGE_KEYS.BASIC_INFO);
        if (savedBasicInfo) {
          const basicInfo = JSON.parse(savedBasicInfo);
          setFormData(prev => ({
            ...prev,
            ...basicInfo,
          }));
        }

        // Load address
        const savedAddress = localStorage.getItem(FORM_STORAGE_KEYS.ADDRESS);
        if (savedAddress) {
          const address = JSON.parse(savedAddress);
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              ...address,
            },
          }));
        }

        // Load current step
        const savedStep = localStorage.getItem(FORM_STORAGE_KEYS.CURRENT_STEP);
        if (savedStep) {
          const step = parseInt(savedStep);
          if (step >= 0 && step < 5) {
            setActiveStep(step);
            // Mark previous steps as completed
            const completed = new Set<number>();
            for (let i = 0; i < step; i++) {
              completed.add(i);
            }
            setCompletedSteps(completed);
          }
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
        // Clear corrupted data
        clearSavedFormData();
      }
    };

    loadSavedFormData();
  }, []);

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (otpSent && !otpVerified && !otpExpired && activeStep === 2) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setOtpExpired(true);
            setError('OTP code has expired. Please resend the code.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [otpSent, otpVerified, otpExpired, activeStep]);

  // Reset OTP timer when step changes
  useEffect(() => {
    if (activeStep !== 2) {
      setOtpTimer(60);
      setOtpExpired(false);
      setOtpSent(false);
      setOtpVerified(false);
      setOtp(['', '', '', '', '', '']);
    }
  }, [activeStep]);

  // Save form data to localStorage
  const saveFormData = (data: Partial<typeof initialFormData>, step: number) => {
    try {
      // Save basic info (excluding password for security)
      const basicInfo = {
        username: data.username || formData.username,
        fullName: data.fullName || formData.fullName,
        email: data.email || formData.email,
        phone: data.phone || formData.phone,
      };
      localStorage.setItem(FORM_STORAGE_KEYS.BASIC_INFO, JSON.stringify(basicInfo));

      // Save address
      if (data.address) {
        localStorage.setItem(FORM_STORAGE_KEYS.ADDRESS, JSON.stringify(data.address));
      }

      // Save current step
      localStorage.setItem(FORM_STORAGE_KEYS.CURRENT_STEP, step.toString());
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  // Clear saved form data
  const clearSavedFormData = () => {
    try {
      localStorage.removeItem(FORM_STORAGE_KEYS.BASIC_INFO);
      localStorage.removeItem(FORM_STORAGE_KEYS.ADDRESS);
      localStorage.removeItem(FORM_STORAGE_KEYS.CURRENT_STEP);
    } catch (error) {
      console.error('Error clearing saved form data:', error);
    }
  };

  const steps = [
    { label: 'Basic Information', description: 'Enter your account information' },
    { label: 'Email Verification', description: 'Send OTP code' },
    { label: 'OTP Verification', description: 'Enter OTP code' },
    { label: 'Address Information', description: 'Enter delivery address' },
    { label: 'Finish', description: 'Save address and complete' },
  ];

  // Handlers
  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFormData(prev => ({ ...prev, [field]: newValue }));
    
    // Save basic info (excluding password)
    if (field !== 'password' && field !== 'confirmPassword') {
      saveFormData({ [field]: newValue }, activeStep);
    }
  };

  const handleAddressChange = (field: keyof typeof formData.address) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = field === 'isDefault' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData(prev => ({
          ...prev,
        address: { ...prev.address, [field]: value },
      }));
      
      // Save address data
      saveFormData({ 
        address: { ...formData.address, [field]: value } 
      }, activeStep);
    };

  const handleNext = () => {
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    saveFormData({}, nextStep);
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
    saveFormData({}, prevStep);
  };

  const handleStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  // Step 1: Basic info validation
  const validateBasicInfo = (data: typeof initialFormData) => {
    const errors: Record<string, string> = {};
    if (!data.username) errors.username = 'Please enter your username';
    if (!data.fullName) errors.fullName = 'Please enter your full name';
    if (!data.email) errors.email = 'Please enter your email';
    if (!data.password) errors.password = 'Please enter your password';
    if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!data.phone) errors.phone = 'Please enter your phone number';
    return errors;
  };

  const handleBasicInfoSubmit = () => {
    const errors = validateBasicInfo(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    handleStepComplete(0);
    handleNext();
  };

  // Kill verification process
  const handleKillVerification = async () => {
    setLoading(true);
    try {
      // Thử gọi resend-verification để gửi lại OTP
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      
      const data = await response.json();
      console.log('Resend verification response:', data);
      
      if (data.success) {
        // Reset OTP state và chuyển sang step 3
        setOtpSent(true);
        setOtpVerified(false);
        setOtpTimer(60);
        setOtpExpired(false);
        setOtp(['', '', '', '', '', '']);
        setError('');
        handleStepComplete(1);
        handleNext();
      } else {
        // Nếu resend không thành công, thử cách khác
        console.log('Resend failed, trying alternative approach...');
        
        // Thử gọi register lại với cùng thông tin
        const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
          }),
        });
        
        const registerData = await registerResponse.json();
        console.log('Re-register response:', registerData);
        
        if (registerData.success) {
          setOtpSent(true);
          setOtpTimer(60);
          setOtpExpired(false);
          setOtp(['', '', '', '', '', '']);
          setError('');
          handleStepComplete(1);
          handleNext();
        } else {
          setError(registerData.message || 'Cannot resend OTP');
        }
      }
    } catch (err) {
      console.error('Kill verification error:', err);
      setError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send OTP to email
  const handleSendOTP = async () => {
    setLoading(true);
    try {
      // Đầu tiên gọi register để tạo verification data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });
      
      const data = await response.json();
      console.log('Register response:', data); // Debug log
      
      if (data.success) {
        setOtpSent(true);
        setOtpTimer(60); // Reset timer
        setOtpExpired(false);
        setOtp(['', '', '', '', '', '']); // Reset OTP input
        setError(''); // Clear any previous errors
        handleStepComplete(1);
        handleNext();
      } else {
        // Xử lý lỗi "Email is already in verification process"
        if (data.message === 'Email is already in verification process') {
          setError('verification_in_progress'); // Use a special error code
          return;
        }
        
        // Nếu có lỗi validation từ register
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setError(data.message || 'Cannot send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleOTPChange = (index: number, value: string) => {
    // Chỉ cho phép nhập số
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Tự động chuyển đến ô tiếp theo khi nhập số
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-otp-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Xử lý phím Backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-otp-index="${index - 1}"]`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    
    pastedData.forEach((value, index) => {
      if (index < 6 && /^\d$/.test(value)) {
        newOtp[index] = value;
      }
    });
    
    setOtp(newOtp);
    
    // Focus vào ô cuối cùng hoặc ô đầu tiên trống
    const lastFilledIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
    const focusInput = document.querySelector(`input[data-otp-index="${focusIndex}"]`) as HTMLInputElement;
    if (focusInput) {
      focusInput.focus();
    }
  };

  const handleVerifyOTP = async () => {
    if (otpExpired) {
      setError('OTP code has expired. Please resend the code.');
      return;
    }
    
    if (otp.some(digit => !digit)) {
      setError('Please enter all 6 OTP digits');
      return;
    }
    setLoading(true);
    try {
      const requestBody = { 
        email: formData.email,
        code: otp.join('')
      };
      
      console.log('Sending verify OTP request:', {
        url: `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
        body: requestBody
      });
      
      // Thử endpoint verify-email trước
      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Nếu verify-email không hoạt động, thử verify-otp
      if (!response.ok && response.status === 404) {
        console.log('Trying verify-otp endpoint instead...');
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            otp: otp.join('')
          }),
        });
        console.log('Verify-OTP response status:', response.status);
      }
      
      // Kiểm tra response có phải JSON không
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!response.ok) {
        // Nếu response không thành công, lấy text để debug
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = JSON.parse(errorText);
            setError(errorData.message || `Error ${response.status}: ${response.statusText}`);
          } catch {
            setError(`Error ${response.status}: ${response.statusText}`);
          }
        } else {
          setError(`Server error ${response.status}: ${response.statusText}`);
        }
        return;
      }
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('Verify OTP response:', data);
      
      if (data.success) {
        setOtpVerified(true);
        setOtpExpired(false); // Reset expired state
        handleStepComplete(2);
        handleNext();
      } else {
        setError(data.message || 'OTP code is incorrect');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      if (err instanceof Error && err.message.includes('non-JSON response')) {
        setError('Server error: Invalid response. Please try again.');
      } else {
        setError('Server connection error. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Address validation
  const validateAddress = (data: typeof initialFormData) => {
    const errors: Record<string, string> = {};
    if (!data.address.recipientName) errors['address.recipientName'] = 'Please enter the recipient name';
    if (!data.address.street) errors['address.street'] = 'Please enter the street';
    if (!data.address.city) errors['address.city'] = 'Please enter the city';
    if (!data.address.state) errors['address.state'] = 'Please enter the state';
    if (!data.address.country) errors['address.country'] = 'Please enter the country';
    return errors;
  };

  const handleAddressSubmit = () => {
    const errors = validateAddress(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    handleStepComplete(3);
    handleNext();
  };

  // Step 5: Final registration
  const handleFinalRegistration = async () => {
    // Validate address fields
    const addressErrors: Record<string, string> = {};
    if (!formData.address.recipientName) addressErrors.recipientName = 'Please enter the recipient name';
    if (!formData.address.street) addressErrors.street = 'Please enter the street';
    if (!formData.address.city) addressErrors.city = 'Please enter the city';
    if (!formData.address.state) addressErrors.state = 'Please enter the state';
    if (!formData.address.country) addressErrors.country = 'Please enter the country';
    if (!formData.address.addressNumber) addressErrors.addressNumber = 'Please enter the address number';

    if (Object.keys(addressErrors).length > 0) {
      setFieldErrors(addressErrors);
      setError('Please fill in all address information');
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        email: formData.email,
        address: [formData.address] // Gửi dưới dạng array như backend mong đợi
      };
      
      console.log('Sending save address request:', {
        url: `${process.env.NEXT_PUBLIC_API_URL}/auth/save-address`,
        body: requestBody
      });

      // Chỉ lưu address vào database, không gọi lại register
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/save-address`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      console.log('Save address response:', data);
      
      if (data.success) {
        handleStepComplete(4);
        // Clear saved form data after successful registration
        clearSavedFormData();
        router.push(`/${locale}/auth/login`);
      } else {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setError(data.message || 'Failed to save address');
      }
    } catch (err) {
      console.error('Save address error:', err);
      setError('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  // Clear form data button
  const handleClearForm = () => {
    setFormData(initialFormData);
    setActiveStep(0);
    setCompletedSteps(new Set());
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpTimer(60);
    setOtpExpired(false);
    setError('');
    setFieldErrors({});
    clearSavedFormData();
  };

  // Handle step click
  const handleStepClick = (stepIndex: number) => {
    // Chỉ cho phép click vào các step đã hoàn thành hoặc step hiện tại
    if (stepIndex <= activeStep || completedSteps.has(stepIndex)) {
      setActiveStep(stepIndex);
      saveFormData({}, stepIndex);
      
      // Clear error khi chuyển step
      setError('');
      setFieldErrors({});
    }
  };

  // Handle back with confirmation for step 2 and 3
  const handleBackWithConfirmation = () => {
    if (activeStep === 2 && otpSent) {
      // Nếu đang ở step 3 (verify OTP) và đã gửi OTP, hỏi xác nhận
      if (window.confirm('Are you sure you want to go back? The OTP will still be valid.')) {
        handleBack();
      }
    } else {
      handleBack();
    }
  };

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'gray', mb: 1 }}>
              💡 Information will be automatically saved so you dont have to enter it again
            </Typography>
            
            <TextField
              label="Tên đăng nhập"
              variant="outlined"
              required
              fullWidth
              value={formData.username}
              onChange={handleChange('username')}
              error={Boolean(fieldErrors.username)}
              helperText={fieldErrors.username}
              sx={inputStyle}
            />
            <TextField
              label="Full Name"
              variant="outlined"
              required
              fullWidth
              value={formData.fullName}
              onChange={handleChange('fullName')}
              error={Boolean(fieldErrors.fullName)}
              helperText={fieldErrors.fullName}
              sx={inputStyle}
            />
            <TextField
              label="Email"
              variant="outlined"
              required
              fullWidth
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              sx={inputStyle}
            />
            <TextField
              label="Password"
              variant="outlined"
              required
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputStyle}
            />
            <TextField
              label="Confirm Password"
              variant="outlined"
              required
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={Boolean(fieldErrors.confirmPassword)}
              helperText={fieldErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputStyle}
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              required
              fullWidth
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={Boolean(fieldErrors.phone)}
              helperText={fieldErrors.phone}
              sx={inputStyle}
            />
            <Button onClick={handleBasicInfoSubmit} fullWidth variant="contained" sx={buttonStyle}>
              Continue
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Xác thực Email</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We will send an OTP code to your email: <strong>{formData.email}</strong>
            </Typography>

            {/* Error message with kill verification option */}
            {error === 'verification_in_progress' && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#856404', mb: 2 }}>
                  This email is currently being verified. You can resend the OTP code or change your email.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    onClick={handleKillVerification}
                    variant="outlined"
                    size="small"
                    disabled={loading}
                    sx={{
                      borderRadius: 0,
                      borderColor: '#856404',
                      color: '#856404',
                      '&:hover': { 
                        borderColor: '#6c5ce7', 
                        backgroundColor: '#f8f9fa' 
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={16} /> : 'Resend OTP'}
                  </Button>
                  <Button
                    onClick={() => {
                      setError('');
                      setActiveStep(0);
                      setCompletedSteps(new Set());
                    }}
                    variant="text"
                    size="small"
                    sx={{
                      borderRadius: 0,
                      color: '#856404',
                      '&:hover': { 
                        backgroundColor: '#f8f9fa' 
                      },
                    }}
                  >
                    Change email
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Other error messages */}
            {error && error !== 'verification_in_progress' && (
              <Typography variant="body2" sx={{ color: 'error.main', mb: 2 }}>
                {error}
              </Typography>
            )}
            
            <Button
              onClick={handleSendOTP}
              fullWidth
              variant="contained"
              disabled={loading || error === 'verification_in_progress'}
              sx={buttonStyle}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
            
            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                onClick={handleBackWithConfirmation}
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 0,
                  borderColor: 'black',
                  color: 'black',
                  '&:hover': { borderColor: '#333', backgroundColor: '#f5f5f5' },
                }}
              >
                Back
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>Enter OTP code</Typography>
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
              The OTP code has been sent to {formData.email}
            </Typography>
            
            {/* Timer display */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: otpTimer <= 10 ? 'error.main' : 'primary.main',
                  fontFamily: 'monospace'
                }}
              >
                {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'gray', mt: 1 }}>
                {otpExpired ? 'OTP code has expired' : 'Time remaining'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
              {otp.map((digit, index) => (
            <TextField
                  key={index}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleOTPKeyDown(index, e)}
                  onPaste={handleOTPPaste}
                  variant="outlined"
                  size="small"
                  disabled={otpExpired}
                  inputProps={{
                    maxLength: 1,
                    style: { 
                      textAlign: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.1em'
                    },
                    'data-otp-index': index.toString(),
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  sx={{
                    width: '50px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      '& fieldset': {
                        borderColor: otpExpired ? 'error.main' : 'black',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: otpExpired ? 'error.main' : 'black',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: otpExpired ? 'error.main' : 'black',
                      },
                      '&.Mui-disabled fieldset': {
                        borderColor: 'gray',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '8px 4px',
                    },
                  }}
                />
              ))}
            </Box>
            
            {/* Hướng dẫn nhập OTP */}
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'gray', mb: 2 }}>
              💡 Enter numbers to automatically move to the next field | Paste to quickly enter
            </Typography>
            
            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={handleBackWithConfirmation}
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 0,
                  borderColor: 'black',
                  color: 'black',
                  '&:hover': { borderColor: '#333', backgroundColor: '#f5f5f5' },
                }}
              >
                Back
              </Button>
              
              {otpExpired ? (
                <Button 
                  onClick={handleSendOTP} 
                  variant="contained" 
                  disabled={loading} 
                  fullWidth
                  sx={{
                    ...buttonStyle,
                    backgroundColor: 'error.main',
                    '&:hover': { backgroundColor: 'error.dark' },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Resend OTP'}
                </Button>
              ) : (
                <Button 
                  onClick={handleVerifyOTP} 
                  variant="contained" 
                  disabled={loading || otpExpired} 
                  fullWidth
                  sx={buttonStyle}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                </Button>
              )}
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Delivery address information</Typography>
            <Typography variant="body2" sx={{ color: 'gray', mb: 1 }}>
              💡 Address will be automatically saved
            </Typography>
            
            <TextField
              label="Recipient Name"
              variant="outlined"
              required
              fullWidth
              value={formData.address.recipientName}
              onChange={handleAddressChange('recipientName')}
              error={Boolean(fieldErrors['address.recipientName'])}
              helperText={fieldErrors['address.recipientName']}
              sx={inputStyle}
            />

            <TextField
              label="Address Number"
              variant="outlined"
              fullWidth
              value={formData.address.addressNumber}
              onChange={handleAddressChange('addressNumber')}
              sx={inputStyle}
            />

            <TextField
              label="Street"
              variant="outlined"
              required
              fullWidth
              value={formData.address.street}
              onChange={handleAddressChange('street')}
              error={Boolean(fieldErrors['address.street'])}
              helperText={fieldErrors['address.street']}
              sx={inputStyle}
            />

            <TextField
              label="City"
              variant="outlined"
              required
              fullWidth
              value={formData.address.city}
              onChange={handleAddressChange('city')}
              error={Boolean(fieldErrors['address.city'])}
              helperText={fieldErrors['address.city']}
              sx={inputStyle}
            />

            <TextField
              label="State/City"
              variant="outlined"
              required
              fullWidth
              value={formData.address.state}
              onChange={handleAddressChange('state')}
              error={Boolean(fieldErrors['address.state'])}
              helperText={fieldErrors['address.state']}
              sx={inputStyle}
            />

            <TextField
              label="Country"
              variant="outlined"
              required
              fullWidth
              value={formData.address.country}
              onChange={handleAddressChange('country')}
              error={Boolean(fieldErrors['address.country'])}
              helperText={fieldErrors['address.country']}
              sx={inputStyle}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.address.isDefault}
                  onChange={handleAddressChange('isDefault')}
                  color="primary"
                />
              }
              label="Set as default address"
            />
            
            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={handleBackWithConfirmation}
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 0,
                  borderColor: 'black',
                  color: 'black',
                  '&:hover': { borderColor: '#333', backgroundColor: '#f5f5f5' },
                }}
              >
                Back
              </Button>
              <Button 
                onClick={handleAddressSubmit} 
                variant="contained" 
                fullWidth
                sx={buttonStyle}
              >
                Continue
              </Button>
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'green', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Confirm information</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your account has been created successfully! Now we will save your delivery address.
            </Typography>
            
            <Box sx={{ textAlign: 'left', mb: 3, p: 2, border: '1px solid #ddd' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Account information:
              </Typography>
              <Typography variant="body2">Username: {formData.username}</Typography>
              <Typography variant="body2">Full Name: {formData.fullName}</Typography>
              <Typography variant="body2">Email: {formData.email}</Typography>
              <Typography variant="body2">Phone Number: {formData.phone}</Typography>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
                Delivery address:
              </Typography>
              <Typography variant="body2">Recipient Name: {formData.address.recipientName}</Typography>
              <Typography variant="body2">Address: {formData.address.addressNumber} {formData.address.street}</Typography>
              <Typography variant="body2">City: {formData.address.city}</Typography>
              <Typography variant="body2">State/City: {formData.address.state}</Typography>
              <Typography variant="body2">Country: {formData.address.country}</Typography>
            </Box>

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
                onClick={handleBackWithConfirmation}
                variant="outlined"
              fullWidth
                sx={{
                  borderRadius: 0,
                  borderColor: 'black',
                  color: 'black',
                  '&:hover': { borderColor: '#333', backgroundColor: '#f5f5f5' },
                }}
              >
                Back
              </Button>
              <Button
                onClick={handleFinalRegistration}
              variant="contained"
              disabled={loading}
                fullWidth
              sx={buttonStyle}
            >
                {loading ? <CircularProgress size={24} /> : 'Save address and complete'}
            </Button>
          </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, backgroundColor: 'black' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', backgroundColor: 'white', borderRadius: 0, border: '2px solid black' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'black', mb: 1 }}>
              {t('title')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'gray', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem' }}>
              {t('subtitle')}{' '}
              <MuiLink component={Link} href={`/${locale}/auth/login`} color="primary" underline="hover">
                {t('loginLink')}
              </MuiLink>
            </Typography>
          </Box>

          {/* Clear form button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              onClick={handleClearForm}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 0,
                borderColor: 'gray',
                color: 'gray',
                '&:hover': { borderColor: 'black', color: 'black' },
              }}
            >
              Delete saved data
            </Button>
          </Box>

          {/* Social Login Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Image src="/google-icon.svg" alt="Google" width={24} height={24} style={{ marginRight: 8 }} />}
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
              sx={{ 
                mb: 2,
                borderRadius: 0,
                borderColor: 'black',
                color: 'black',
                '&:hover': { 
                  borderColor: 'black', 
                  bgcolor: 'grey.50' 
                },
              }}
            >
              {t('continueWithGoogle')}
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<Facebook />} 
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`}
              sx={{ 
                mb: 2,
                borderRadius: 0,
                borderColor: 'black',
                color: 'black',
                '&:hover': { 
                  borderColor: 'black', 
                  bgcolor: 'grey.50' 
                },
              }}
            >
              {t('continueWithFacebook')}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ flex: 1, height: 1, backgroundColor: 'gray' }} />
            <Typography sx={{ mx: 2, color: 'gray' }}>{t('orRegisterWithEmail')}</Typography>
            <Box sx={{ flex: 1, height: 1, backgroundColor: 'gray' }} />
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  onClick={() => handleStepClick(index)}
                  sx={{
                    cursor: (index <= activeStep || completedSteps.has(index)) ? 'pointer' : 'default',
                    '&:hover': {
                      opacity: (index <= activeStep || completedSteps.has(index)) ? 0.8 : 1,
                    },
                  }}
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: completedSteps.has(index) ? 'green' : activeStep === index ? 'black' : 'gray',
                        color: 'white',
                        fontSize: '1rem',
                        cursor: (index <= activeStep || completedSteps.has(index)) ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: (index <= activeStep || completedSteps.has(index)) ? 
                            (completedSteps.has(index) ? '#2e7d32' : '#333') : 'inherit',
                        },
                      }}
                    >
                      {completedSteps.has(index) ? <CheckCircle /> : index + 1}
                    </Box>
                  )}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{step.label}</Typography>
                  <Typography variant="body2" sx={{ color: 'gray' }}>{step.description}</Typography>
                </StepLabel>
                <StepContent>{renderStepContent(index)}</StepContent>
              </Step>
            ))}
          </Stepper>

          {/* Navigation hint */}
          {activeStep > 0 && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef' }}>
              <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center' }}>
                💡 You can click on the completed steps to edit
              </Typography>
            </Box>
          )}

          {/* Error message */}
          {error && (
            <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 2, p: 1, backgroundColor: 'rgba(211, 47, 47, 0.1)', borderRadius: 1 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'gray' }}>
              {t('alreadyHaveAccount')}{' '}
              <MuiLink component={Link} href={`/${locale}/auth/login`} color="primary" underline="hover" sx={{ fontWeight: 'bold' }}>
                {t('signIn')}
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    '& fieldset': { borderColor: 'black', borderWidth: 2 },
    '&:hover fieldset': { borderColor: 'black' },
    '&.Mui-focused fieldset': { borderColor: 'black' },
    '&.Mui-error fieldset': { borderColor: 'red' },
  },
  '& .MuiInputLabel-root': {
    color: 'black',
    fontWeight: 600,
    '&.Mui-focused': { color: 'black' },
    '&.Mui-error': { color: 'red' },
  },
  '& .MuiFormHelperText-root': { color: 'red', fontWeight: 500 },
};

const buttonStyle = {
  borderRadius: 0,
  backgroundColor: 'black',
  color: 'white',
  fontWeight: 900,
  fontSize: '1.1rem',
  letterSpacing: '0.1em',
  padding: '16px',
  mt: 2,
  '&:hover': { backgroundColor: '#333' },
  '&:active': { backgroundColor: '#000' },
};
