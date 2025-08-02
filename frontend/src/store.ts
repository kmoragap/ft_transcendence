type User = {
  username: string;
  avatarUrl: string;
  language: string;
};

type State = {
  isAuthenticated: boolean;
  currentUser: User | null;
};

class Store extends EventTarget {
  private state: State = {
    isAuthenticated: false,
    currentUser: null,
  };

  getState(): State {
    return this.state;
  }

  setState(newState: Partial<State>) {
    this.state = { ...this.state, ...newState };
    this.dispatchEvent(new Event("statechange"));
  }

  subscribe(callback: () => void) {
    this.addEventListener("statechange", callback);
  }

  unsubscribe(callback: () => void) {
    this.removeEventListener("statechange", callback);
  }
}

export const store = new Store();
