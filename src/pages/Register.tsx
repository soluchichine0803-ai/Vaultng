import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Wallet, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ParticleBackground from '../components/ui/ParticleBackground';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+234',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeToTerms: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
    }
  }, [searchParams]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    let processedValue: string | boolean = type === 'checkbox' ? checked : value;

    if (name === 'phone') {
      // Numeric input only
      processedValue = value.replace(/\D/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (formData.countryCode === '+234') {
        // Nigerian numbers: 10 digits (no leading 0) or 11 digits (leading 0)
        const isTenDigits = phoneDigits.length === 10 && !phoneDigits.startsWith('0');
        const isElevenDigits = phoneDigits.length === 11 && phoneDigits.startsWith('0');

        if (!isTenDigits && !isElevenDigits) {
          errors.phone = 'Invalid phone number format';
        }
      } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        errors.phone = 'Invalid phone number length';
      }
    }

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Normalize phone number: remove leading 0 if present for consistency with country code
      let normalizedPhone = formData.phone.replace(/\D/g, '');
      if (formData.countryCode === '+234' && normalizedPhone.length === 11 && normalizedPhone.startsWith('0')) {
        normalizedPhone = normalizedPhone.substring(1);
      }

      const submissionData = {
        ...formData,
        phone: `${formData.countryCode}${normalizedPhone}`
      };

      await register(submissionData);
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '';
      if (errorMessage.toLowerCase().includes('email')) {
        setValidationErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('phone')) {
        setValidationErrors(prev => ({ ...prev, phone: errorMessage }));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-primary relative overflow-hidden">
      <ParticleBackground />

      <Card className="w-full max-w-md p-8 lg:p-10 space-y-8 border-white/[0.02] relative z-10">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-purple-primary flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <Wallet className="text-white w-7 h-7" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Initiate Account</h1>
          <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-widest">Operational: Node Initialization</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 w-5 h-5 shrink-0" />
            <p className="text-xs text-red-200 leading-relaxed font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={handleInputChange}
              error={validationErrors.firstName}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleInputChange}
              error={validationErrors.lastName}
              required
            />
          </div>
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleInputChange}
            error={validationErrors.email}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Phone Number
            </label>
            <div className="flex gap-2">
              <div className="w-28 shrink-0">
                <Input
                  name="countryCode"
                  variant="select"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  options={[
                    { value: '+234', label: '🇳🇬 +234' },
                    { value: '+1', label: '🇺🇸 +1' },
                    { value: '+44', label: '🇬🇧 +44' },
                  ]}
                />
              </div>
              <div className="flex-1">
                <Input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="803 711 2873"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={validationErrors.phone}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              error={validationErrors.password}
            />
            <Input
              label="Confirm"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={validationErrors.confirmPassword}
            />
          </div>

          <Input
            label="Referral Code (Optional)"
            name="referralCode"
            placeholder="ABC123"
            value={formData.referralCode}
            onChange={handleInputChange}
          />

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="mt-1 accent-purple-primary w-4 h-4 rounded border-white/10 bg-white/5"
            />
            <label htmlFor="terms" className="text-[11px] text-text-muted leading-relaxed">
              I agree to the <Link to="/terms" className="text-purple-soft font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-purple-soft font-bold hover:underline">Privacy Policy</Link>, acknowledging the financial risks involved.
            </label>
          </div>
          {validationErrors.agreeToTerms && (
            <p className="text-[10px] text-red-500 font-medium">{validationErrors.agreeToTerms}</p>
          )}

          <Button
            type="submit"
            loading={isLoading}
            className="w-full h-12 lg:h-14 font-black uppercase text-xs tracking-[0.2em]"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">
          Already a member?{' '}
          <Link to="/login" className="text-purple-soft font-bold hover:underline">
            Log In
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
