const STORAGE_KEY = 'skinsync_user_data';

export const storage = {
  getUser() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  setUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  updateProfile(profile) {
    const user = this.getUser() || {};
    user.skinProfile = profile;
    user.onboardingComplete = true;
    this.setUser(user);
  },

  setLoggedIn(status, userName = '') {
    const existingUser = this.getUser();
    const user = existingUser || { skinProfile: {}, onboardingComplete: false };
    user.isLoggedIn = status;
    if (userName) user.userName = userName;
    if (existingUser) {
      user.skinProfile = existingUser.skinProfile;
      user.onboardingComplete = existingUser.onboardingComplete;
    }
    this.setUser(user);
  },

  isLoggedIn() {
    const user = this.getUser();
    return user?.isLoggedIn || false;
  },

  isOnboardingComplete() {
    const user = this.getUser();
    return user?.onboardingComplete || false;
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
