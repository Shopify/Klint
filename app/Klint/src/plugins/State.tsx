declare module "../component/Klint" {
  interface KlintPlugins {
    State: State;
  }
}

type KlintStateValue = unknown;
type KlintStateCallback = (key: string, value: KlintStateValue) => void;
interface KlintState {
  set(key: string, value: KlintStateValue, callback?: KlintStateCallback): void;
  get(key: string, callback?: KlintStateCallback): KlintStateValue;
  has(key: string): boolean;
  delete(key: string, callback?: (key: string) => void): void;
  log(): Map<string, KlintStateValue>;
}
class State implements KlintState {
  private store = new Map<string, KlintStateValue>();

  set(key: string, value: KlintStateValue, callback?: KlintStateCallback) {
    this.store.set(key, value);
    callback?.(key, value);
  }

  get(key: string, callback?: KlintStateCallback) {
    const value = this.store.get(key);
    callback?.(key, value);
    return value;
  }

  has(key: string) {
    return this.store.has(key);
  }

  delete(key: string, callback?: (key: string) => void) {
    this.store.delete(key);
    callback?.(key);
  }

  log() {
    return this.store;
  }
}

export default State;
