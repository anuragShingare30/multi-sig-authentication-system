

import { WalletConnection } from '@/components/WalletConnection';
import { RegisterForm } from '@/components/RegisterForm';
import { ApprovalDashboard } from '@/components/ApprovalDashboard';
import { AuthStatus } from '@/components/AuthStatus';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Auth Wallet Access
          </h1>
          <p className="text-gray-600">
            Multi-signature wallet authentication system
          </p>
        </div>
        
        <div className="mb-8">
          <WalletConnection />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <RegisterForm />
          </div>
          <div>
            <ApprovalDashboard />
          </div>
          <div>
            <AuthStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
