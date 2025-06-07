export function isTauriEnvironment(): boolean {
  try {
    return typeof window !== 'undefined' && 
           window !== null && 
           '__TAURI__' in window && 
           window.__TAURI__ !== undefined;
  } catch {
    return false;
  }
}

export async function safeInvoke<T>(command: string, args?: any): Promise<T | null> {
  if (!isTauriEnvironment()) {
    console.warn(`Tauri invoke called in non-Tauri environment: ${command}`);
    return null;
  }

  try {

    const { invoke } = await import('@tauri-apps/api/core');
    console.log(`Invoking Tauri command: ${command}`, args);
    const result = await invoke<T>(command, args);
    console.log(`Command ${command} result:`, result);
    return result;
  } catch (error) {
    console.error(`Tauri invoke failed for command ${command}:`, error);

    if (typeof error === 'string') {
      throw new Error(error);
    }

    throw error;
  }
}

export function isWebMode(): boolean {
  return !isTauriEnvironment();
}