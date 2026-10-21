import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SAMPLE_TREE } from '../../domain/sampleTree';
import { TREE_STORAGE_KEY } from '../../store/treeStorage';
import { renderApp } from '../../test/renderApp';
import { MAX_FILE_SIZE } from './HomePage';

/**
 * Creates a JSON file for upload tests.
 * @param content - File content.
 * @param name - File name.
 * @returns The file.
 */
function jsonFile(content: string, name = 'tree.json'): File {
  return new File([content], name, { type: 'application/json' });
}

describe('HomePage', () => {
  it('loads pasted JSON and opens the tree view', async () => {
    const { user, location } = renderApp();
    const input = screen.getByRole('textbox', { name: 'JSON' });
    fireEvent.change(input, { target: { value: JSON.stringify(SAMPLE_TREE) } });
    await user.click(screen.getByRole('button', { name: 'Wczytaj' }));

    expect(location().pathname).toBe('/tree');
    expect(screen.getByRole('heading', { name: 'Drzewo: root' })).toBeInTheDocument();
    expect(localStorage.getItem(TREE_STORAGE_KEY)).not.toBeNull();
  });

  it('shows the validation error with its location', async () => {
    const { user, location } = renderApp();
    fireEvent.change(screen.getByRole('textbox', { name: 'JSON' }), {
      target: { value: '{"name":"r","type":"folder","children":[{"name":"a","type":"file"}]}' },
    });
    await user.click(screen.getByRole('button', { name: 'Wczytaj' }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Nie można wczytać JSON');
    expect(alert).toHaveTextContent('"size"');
    expect(alert).toHaveTextContent('$.children[0]');
    expect(location().pathname).toBe('/');
  });

  it('shows an error for empty input', async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: 'Wczytaj' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Pole jest puste');
  });

  it('inserts the example JSON into the text field', async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: 'Wstaw przykład' }));
    expect(screen.getByRole('textbox', { name: 'JSON' })).toHaveValue(
      JSON.stringify(SAMPLE_TREE, null, 2),
    );
  });

  it('loads the large example', async () => {
    const { user, location } = renderApp();
    await user.click(screen.getByRole('button', { name: /Duży przykład \(55\s555 węzłów\)/ }));
    expect(location().pathname).toBe('/tree');
  });

  it('loads an uploaded file', async () => {
    const { user, location } = renderApp();
    await user.upload(screen.getByLabelText('Plik JSON'), jsonFile(JSON.stringify(SAMPLE_TREE)));
    await waitFor(() => expect(location().pathname).toBe('/tree'));
  });

  it('shows the file name when an uploaded file is not valid', async () => {
    const { user } = renderApp();
    await user.upload(screen.getByLabelText('Plik JSON'), jsonFile('not json', 'bad.json'));
    expect(await screen.findByRole('alert')).toHaveTextContent('bad.json');
  });

  it('rejects a file larger than the limit', async () => {
    const { user } = renderApp();
    const file = jsonFile('{}');
    Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE + 1 });
    await user.upload(screen.getByLabelText('Plik JSON'), file);
    expect(await screen.findByRole('alert')).toHaveTextContent('50 MB');
  });

  it('loads a dropped file', async () => {
    const { location } = renderApp();
    fireEvent.drop(screen.getByTestId('file-dropzone'), {
      dataTransfer: { files: [jsonFile(JSON.stringify(SAMPLE_TREE))] },
    });
    await waitFor(() => expect(location().pathname).toBe('/tree'));
  });

  it('shows the loaded tree and clears it after confirmation', async () => {
    const { user } = renderApp({ storedTree: SAMPLE_TREE });
    expect(screen.getByText(/Wczytane drzewo:/)).toHaveTextContent('root (6 węzłów)');

    await user.click(screen.getByRole('button', { name: 'Wyczyść' }));
    const dialog = screen.getByRole('dialog', { name: 'Wyczyścić drzewo?' });
    await user.click(within(dialog).getByRole('button', { name: 'Wyczyść' }));

    await waitFor(() => expect(screen.queryByText(/Wczytane drzewo:/)).not.toBeInTheDocument());
    expect(localStorage.getItem(TREE_STORAGE_KEY)).toBeNull();
  });

  it('keeps the tree when the user cancels clearing', async () => {
    const { user } = renderApp({ storedTree: SAMPLE_TREE });
    await user.click(screen.getByRole('button', { name: 'Wyczyść' }));
    await user.click(screen.getByRole('button', { name: 'Anuluj' }));
    expect(localStorage.getItem(TREE_STORAGE_KEY)).not.toBeNull();
  });
});
