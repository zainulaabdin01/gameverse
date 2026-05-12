/**
 * User Authentication System
 * Simple authentication and user management
 */

import { createServerFn } from "@tanstack/react-start";
import { getDB } from "../server/db";
import { getCachedData, CACHE_TTL } from "../server/cache";

export interface User {
  id: string;
  email: string;
  username: string;
  preferences: UserPreferences;
  createdAt: string;
  lastActive: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    liveEvents: boolean;
    newsUpdates: boolean;
  };
  content: {
    favoriteGames: string[];
    favoriteTeams: string[];
    blockedSources: string[];
  };
  display: {
    layout: 'grid' | 'list';
    itemsPerPage: number;
    showRatings: boolean;
    showReleaseDates: boolean;
  };
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

/**
 * User registration
 */
export const registerUserFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; username: string; password: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = await getDB();
      
      // Check if user already exists
      const existingUser = await db.prepare(`
        SELECT id FROM user_sessions WHERE email = ?
      `).bind(data.email).first();
      
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }
      
      // Create new user
      const userId = crypto.randomUUID();
      const hashedPassword = await hashPassword(data.password);
      const defaultPreferences: UserPreferences = {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          liveEvents: true,
          newsUpdates: true
        },
        content: {
          favoriteGames: [],
          favoriteTeams: [],
          blockedSources: []
        },
        display: {
          layout: 'grid',
          itemsPerPage: 20,
          showRatings: true,
          showReleaseDates: true
        }
      };
      
      await db.prepare(`
        INSERT INTO user_sessions (id, email, preferences, created_at, last_active)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        userId,
        data.email,
        JSON.stringify(defaultPreferences),
        new Date().toISOString(),
        new Date().toISOString()
      ).run();
      
      const user: User = {
        id: userId,
        email: data.email,
        username: data.username,
        preferences: defaultPreferences,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      const token = generateToken(userId);
      
      console.log(`[Auth] User registered: ${data.email}`);
      return { success: true, user, token };
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      return { success: false, error: 'Registration failed' };
    }
  });

/**
 * User login
 */
export const loginUserFn = createServerFn({ method: "POST" })
  .inputValidator((data: AuthRequest) => data)
  .handler(async ({ data }) => {
    try {
      const db = await getDB();
      
      // Get user from database
      const user = await db.prepare(`
        SELECT id, email, preferences, created_at, last_active
        FROM user_sessions
        WHERE email = ?
      `).bind(data.email).first();
      
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }
      
      // In a real implementation, you'd verify the password hash
      // For demo purposes, we'll accept any password
      const userObj: User = {
        id: user.id,
        email: user.email,
        username: user.email.split('@')[0], // Use email prefix as username
        preferences: JSON.parse(user.preferences || '{}'),
        createdAt: user.created_at,
        lastActive: user.last_active
      };
      
      // Update last active
      await db.prepare(`
        UPDATE user_sessions SET last_active = ? WHERE id = ?
      `).bind(new Date().toISOString(), user.id).run();
      
      const token = generateToken(user.id);
      
      console.log(`[Auth] User logged in: ${data.email}`);
      return { success: true, user: userObj, token };
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  });

/**
 * Get user by token
 */
export const getUserByTokenFn = createServerFn({ method: "GET" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    return await getCachedData(
      `user_token:${data.token}`,
      async () => {
        try {
          const userId = verifyToken(data.token);
          if (!userId) {
            return null;
          }
          
          const db = await getDB();
          const user = await db.prepare(`
            SELECT id, email, preferences, created_at, last_active
            FROM user_sessions
            WHERE id = ?
          `).bind(userId).first();
          
          if (!user) {
            return null;
          }
          
          return {
            id: user.id,
            email: user.email,
            username: user.email.split('@')[0],
            preferences: JSON.parse(user.preferences || '{}'),
            createdAt: user.created_at,
            lastActive: user.last_active
          } as User;
        } catch (error) {
          console.error('[Auth] Failed to get user by token:', error);
          return null;
        }
      },
      CACHE_TTL.NEWS // 5 minutes cache for user data
    );
  });

/**
 * Update user preferences
 */
export const updateUserPreferencesFn = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; preferences: Partial<UserPreferences> }) => data)
  .handler(async ({ data }) => {
    try {
      const userId = verifyToken(data.token);
      if (!userId) {
        return { success: false, error: 'Invalid token' };
      }
      
      const db = await getDB();
      
      // Get current preferences
      const currentPrefs = await db.prepare(`
        SELECT preferences FROM user_sessions WHERE id = ?
      `).bind(userId).first();
      
      const currentPreferences = JSON.parse(currentPrefs?.preferences || '{}');
      const updatedPreferences = { ...currentPreferences, ...data.preferences };
      
      // Update preferences
      await db.prepare(`
        UPDATE user_sessions SET preferences = ?, last_active = ? WHERE id = ?
      `).bind(
        JSON.stringify(updatedPreferences),
        new Date().toISOString(),
        userId
      ).run();
      
      // Clear cache
      await getCachedData(`user_token:${data.token}`, () => Promise.resolve(null));
      
      console.log(`[Auth] Updated preferences for user: ${userId}`);
      return { success: true, preferences: updatedPreferences };
    } catch (error) {
      console.error('[Auth] Failed to update preferences:', error);
      return { success: false, error: 'Failed to update preferences' };
    }
  });

/**
 * Simple password hashing (for demo purposes)
 */
async function hashPassword(password: string): Promise<string> {
  // In a real implementation, use bcrypt or similar
  return btoa(password + 'salt');
}

/**
 * Generate JWT-like token (for demo purposes)
 */
function generateToken(userId: string): string {
  // In a real implementation, use proper JWT
  const payload = { userId, exp: Date.now() + 24 * 60 * 60 * 1000 }; // 24 hours
  return btoa(JSON.stringify(payload));
}

/**
 * Verify token (for demo purposes)
 */
function verifyToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload.userId;
  } catch {
    return null;
  }
}
