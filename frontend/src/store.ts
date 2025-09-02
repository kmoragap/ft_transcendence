type User = {
  username: string;
  email: string;
  firstname: string;
  avatarUrl?: string;
  language?: string;
};

type State = {
  isAuthenticated: boolean;
  currentUser: User | null;
};

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LANGUAGE'; payload: string };

class Store extends EventTarget {
  private state: State = {
    isAuthenticated: false,
    currentUser: null,
  };

  getState(): State {
    return this.state;
  }

  private setState(newState: Partial<State>) {
    this.state = { ...this.state, ...newState };
    this.dispatchEvent(new Event('statechange'));
  }

  subscribe(callback: () => void) {
    this.addEventListener('statechange', callback);
  }

  unsubscribe(callback: () => void) {
    this.removeEventListener("statechange", callback);
  }
  
  dispatch(action: Action) {
    switch (action.type) {
      case 'LOGIN':
        this.setState({
          isAuthenticated: true,
          currentUser: action.payload,
        });
        break;

      case 'LOGOUT':
        this.setState({
          isAuthenticated: false,
          currentUser: null,
        });
        break;

      case 'SET_LANGUAGE':
        if (this.state.currentUser) {
          this.setState({
            currentUser: {
              ...this.state.currentUser,
              language: action.payload,
            },
          });
        }
        break;

      default:
        break;
    }
  }
}

export const store = new Store();
