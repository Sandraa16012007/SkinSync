const STORAGE_KEY = 'skinsync_session';
const USERS_DB_KEY = 'skinsync_users_data';

export const storage = {
  getCurrentSession() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  getCurrentEmail() {
    const session = this.getCurrentSession();
    return session?.email || null;
  },

  getUser() {
    const email = this.getCurrentEmail();
    if (!email) return null;
    const usersDb = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    return usersDb[email] || null;
  },

  setUser(user) {
    const email = this.getCurrentEmail();
    if (!email) return;
    const usersDb = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    usersDb[email] = user;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
  },

  updateProfile(profile) {
    const user = this.getUser() || {};
    user.skinProfile = profile;
    user.onboardingComplete = true;
    this.setUser(user);
  },

  setLoggedIn(status, userName = '', email = '') {
    if (status && email) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, isLoggedIn: true }));
      
      const usersDb = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
      if (!usersDb[email]) {
        usersDb[email] = { userName, skinProfile: {}, onboardingComplete: false };
      } else if (userName && !usersDb[email].userName) {
        usersDb[email].userName = userName;
      }
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
    } else if (!status) {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  isLoggedIn() {
    const session = this.getCurrentSession();
    return session?.isLoggedIn || false;
  },

  isOnboardingComplete() {
    const user = this.getUser();
    return user?.onboardingComplete || false;
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },

  deleteAccount() {
    const email = this.getCurrentEmail();
    if (email) {
      const usersDb = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
      delete usersDb[email];
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
    }
    this.clear();
  }
};
