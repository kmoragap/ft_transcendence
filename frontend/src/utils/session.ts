// This file manages session restoration state and allows components to register callbacks that execute once the session is restored.
type SessionCallback = () => void;

class SessionManager {
  private isRestored = false;
  private callbacks: SessionCallback[] = [];

  isSessionRestored(): boolean {
    return this.isRestored;
  }

  setSessionRestored(): void {
    this.isRestored = true;
    this.callbacks.forEach(callback => callback());
  }

  onSessionRestored(callback: SessionCallback): void {
    if (this.isRestored) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }
}

export const sessionManager = new SessionManager();