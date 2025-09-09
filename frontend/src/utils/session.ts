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

  removeCallback(callback: SessionCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }
}

export const sessionManager = new SessionManager();