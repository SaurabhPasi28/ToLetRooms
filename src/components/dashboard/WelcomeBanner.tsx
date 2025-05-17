  import { IUser } from "@/models/User";

  export default function WelcomeBanner({ user }: { user: IUser }) {
      return (
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-xl p-6 text-white">
          <h1 className="text-2xl --primary md:text-3xl font-bold mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="opacity-90">
            {user.role === 'host' 
              ? 'Manage your properties and view bookings' 
              : 'Find your next perfect stay'}
          </p>
        </div>
      );
    }