/**
 * User Profile Component
 * Displays user preferences and personalization options
 */

import { useState, useEffect } from "react";
import { 
  User, 
  UserPreferences, 
  getUserByTokenFn, 
  updateUserPreferencesFn 
} from "@/user/auth-system";
import { 
  User as UserIcon, 
  Settings, 
  Heart, 
  Eye, 
  Bell, 
  Moon, 
  Sun, 
  Monitor,
  Grid,
  List,
  Save,
  LogOut
} from "lucide-react";

export interface UserProfileProps {
  token?: string;
  onLogout?: () => void;
  className?: string;
}

export function UserProfile({ token, onLogout, className }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'content'>('profile');

  // Load user data
  useEffect(() => {
    if (token) {
      loadUserData();
    }
  }, [token]);

  const loadUserData = async () => {
    try {
      const userData = await getUserByTokenFn({ token: token! });
      setUser(userData);
      setPreferences(userData?.preferences || null);
    } catch (error) {
      console.error('[UserProfile] Failed to load user data:', error);
    }
  };

  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!token || !preferences) return;
    
    setIsSaving(true);
    try {
      const result = await updateUserPreferencesFn({
        token,
        preferences: newPreferences
      });
      
      if (result.success) {
        setPreferences({ ...preferences, ...result.preferences });
        console.log('[UserProfile] Preferences saved successfully');
      }
    } catch (error) {
      console.error('[UserProfile] Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    savePreferences({ theme });
  };

  const handleNotificationChange = (key: keyof UserPreferences['notifications'], value: boolean) => {
    if (!preferences) return;
    savePreferences({
      notifications: {
        ...preferences.notifications,
        [key]: value
      }
    });
  };

  const handleDisplayChange = (key: keyof UserPreferences['display'], value: any) => {
    if (!preferences) return;
    savePreferences({
      display: {
        ...preferences.display,
        [key]: value
      }
    });
  };

  const toggleFavoriteGame = (gameId: string) => {
    if (!preferences) return;
    
    const favorites = [...preferences.content.favoriteGames];
    const index = favorites.indexOf(gameId);
    
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(gameId);
    }
    
    savePreferences({
      content: {
        ...preferences.content,
        favoriteGames: favorites
      }
    });
  };

  const toggleFavoriteTeam = (teamId: string) => {
    if (!preferences) return;
    
    const favorites = [...preferences.content.favoriteTeams];
    const index = favorites.indexOf(teamId);
    
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(teamId);
    }
    
    savePreferences({
      content: {
        ...preferences.content,
        favoriteTeams: favorites
      }
    });
  };

  if (!user) {
    return (
      <div className={`p-6 bg-surface border border-border rounded-lg ${className || ''}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <UserIcon className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Please log in to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Profile Header */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{user.username}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface border border-border rounded-lg">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'content'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Content
          </button>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Account Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">Username</label>
                      <input
                        type="text"
                        value={user.username}
                        readOnly
                        className="w-full p-2 border border-border rounded-md bg-muted text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full p-2 border border-border rounded-md bg-muted text-foreground"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Activity</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Active</span>
                      <span className="text-sm text-foreground">
                        {new Date(user.lastActive).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span className="text-sm text-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && preferences && (
            <div className="space-y-6">
              {/* Theme Settings */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Appearance
                </h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Theme
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                        preferences.theme === 'light'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                        preferences.theme === 'dark'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </button>
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={`px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                        preferences.theme === 'system'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Monitor className="h-4 w-4" />
                      System
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </h3>
                <div className="space-y-3">
                  {Object.entries(preferences.notifications).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNotificationChange(key as any, e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Display Settings */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Display
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Layout
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDisplayChange('layout', 'grid')}
                        className={`px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                          preferences.display.layout === 'grid'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Grid className="h-4 w-4" />
                        Grid
                      </button>
                      <button
                        onClick={() => handleDisplayChange('layout', 'list')}
                        className={`px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                          preferences.display.layout === 'list'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <List className="h-4 w-4" />
                        List
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Items per page
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={preferences.display.itemsPerPage}
                      onChange={(e) => handleDisplayChange('itemsPerPage', parseInt(e.target.value))}
                      className="w-full p-2 border border-border rounded-md bg-surface text-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-foreground">Show ratings</span>
                      <input
                        type="checkbox"
                        checked={preferences.display.showRatings}
                        onChange={(e) => handleDisplayChange('showRatings', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-foreground">Show release dates</span>
                      <input
                        type="checkbox"
                        checked={preferences.display.showReleaseDates}
                        onChange={(e) => handleDisplayChange('showReleaseDates', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => savePreferences(preferences)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && preferences && (
            <div className="space-y-6">
              {/* Favorite Games */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Favorite Games
                </h3>
                <div className="text-sm text-muted-foreground mb-4">
                  Games you've marked as favorites will appear here
                </div>
                {preferences.content.favoriteGames.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-8 w-8 mx-auto mb-2" />
                    <p>No favorite games yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {preferences.content.favoriteGames.map((gameId) => (
                      <div key={gameId} className="p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-foreground">{gameId}</span>
                          <button
                            onClick={() => toggleFavoriteGame(gameId)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Favorite Teams */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Favorite Teams
                </h3>
                <div className="text-sm text-muted-foreground mb-4">
                  Teams you're following will appear here
                </div>
                {preferences.content.favoriteTeams.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-8 w-8 mx-auto mb-2" />
                    <p>No favorite teams yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {preferences.content.favoriteTeams.map((teamId) => (
                      <div key={teamId} className="p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-foreground">{teamId}</span>
                          <button
                            onClick={() => toggleFavoriteTeam(teamId)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
