import { Route, Routes } from 'react-router-dom';
import { NodeDetailsPage } from '../features/details/NodeDetailsPage';
import { TreePage } from '../features/tree/TreePage';
import { HomePage } from '../features/upload/HomePage';
import { AppLayout } from './AppLayout';
import { NotFoundPage } from './NotFoundPage';
import { RequireTree } from './RequireTree';

/**
 * Application routes. The router itself is created in main.tsx (BrowserRouter)
 * or in tests (MemoryRouter).
 * @returns The route tree.
 */
export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="tree"
          element={
            <RequireTree>
              <TreePage />
            </RequireTree>
          }
        />
        <Route
          path="tree/:nodePath"
          element={
            <RequireTree>
              <NodeDetailsPage />
            </RequireTree>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
