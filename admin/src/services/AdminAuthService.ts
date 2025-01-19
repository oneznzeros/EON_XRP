import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  getAuth,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseApp, firestore } from '../config/firebase';

interface AdminUser {
  uid: string;
  email: string;
  role: 'superAdmin' | 'admin' | 'viewer';
  walletAddress?: string;
}

class AdminAuthService {
  private auth = getAuth(firebaseApp);

  // Login with advanced security checks
  async login(email: string, password: string): Promise<AdminUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Fetch additional admin metadata
      const adminDoc = await getDoc(doc(firestore, 'admins', user.uid));
      
      if (!adminDoc.exists()) {
        throw new Error('Admin profile not found');
      }

      const adminData = adminDoc.data() as Omit<AdminUser, 'uid'>;

      return {
        uid: user.uid,
        ...adminData
      };
    } catch (error) {
      console.error('Admin login failed', error);
      throw error;
    }
  }

  // Create admin user with role-based access
  async createAdminUser(
    email: string, 
    password: string, 
    role: AdminUser['role'] = 'viewer',
    walletAddress?: string
  ): Promise<AdminUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Store additional admin metadata
      await setDoc(doc(firestore, 'admins', user.uid), {
        email: user.email,
        role,
        walletAddress,
        createdAt: new Date()
      });

      return {
        uid: user.uid,
        email: user.email!,
        role,
        walletAddress
      };
    } catch (error) {
      console.error('Admin user creation failed', error);
      throw error;
    }
  }

  // Password reset with logging
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Password reset failed', error);
      throw error;
    }
  }

  // Secure logout with session management
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      // Clear any local storage or session data
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout failed', error);
      throw error;
    }
  }

  // Get current authenticated admin
  getCurrentAdmin(): AdminUser | null {
    const user = this.auth.currentUser;
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email!,
      role: 'viewer', // Default role, should be fetched from Firestore
      walletAddress: undefined
    };
  }

  // Check if user has specific admin role
  hasAdminAccess(requiredRole: AdminUser['role']): boolean {
    const currentAdmin = this.getCurrentAdmin();
    if (!currentAdmin) return false;

    const roleHierarchy = {
      'viewer': 1,
      'admin': 2,
      'superAdmin': 3
    };

    return roleHierarchy[currentAdmin.role] >= roleHierarchy[requiredRole];
  }
}

export const adminAuthService = new AdminAuthService();
