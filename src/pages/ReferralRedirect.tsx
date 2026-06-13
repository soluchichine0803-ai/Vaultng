import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ReferralRedirect: React.FC = () => {
  const { referralCode } = useParams<{ referralCode: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (referralCode) {
      // Redirect to register with the referral code as a query parameter
      navigate(`/register?ref=${referralCode}`, { replace: true });
    } else {
      // Fallback to home if no code is present
      navigate('/', { replace: true });
    }
  }, [referralCode, navigate]);

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-primary/20 border-t-purple-primary rounded-full animate-spin" />
    </div>
  );
};

export default ReferralRedirect;
