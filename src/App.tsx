import { StoreProvider } from './state/store';
import Shell from './components/layout/Shell';

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
