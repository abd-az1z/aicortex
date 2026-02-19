import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="min-h-screen hero-bg flex items-center justify-center">
            <SignUp />
        </div>
    );
}
