import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FileInput, Loader, Stack } from '@mantine/core';
import { IconFileUpload } from '@tabler/icons-react';
import { ToolShell } from '@ff8-speedruns/ui';
import { SAVE_FILE_EXTENSION } from './constants';
import SaveSwitcher from './components/SaveSwitcher';
import SectionNav from './components/SectionNav';
import ViewControls from './components/ViewControls';

// The save reader and these views carry the generated memory-map data, so they
// load on demand: the page shell and file picker show up without waiting for it.
const HexViewSection = lazy(() => import('./components/HexViewSection'));
const RowsView = lazy(() => import('./components/RowsView'));
const SaveView = lazy(() => import('./components/SaveView'));

export default function App() {
  const [files, setFiles] = useState([]);
  const [saves, setSaves] = useState([]);
  const [activeFileName, setActiveFileName] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // A search started from outside the box (a field link): remounting the box
  // with the new text keeps its typing state local, which is what keeps typing fast.
  const [searchRequest, setSearchRequest] = useState({ id: 0, text: '' });
  const [isComparing, setIsComparing] = useState(false);
  const [isChangedOnly, setIsChangedOnly] = useState(false);
  // The views are lazy, so they mount after the sidebar has scanned the page
  // for headings. Each one reports in, and the sidebar scans again.
  const [renderedViews, setRenderedViews] = useState(0);
  const handleViewRendered = useCallback(() => setRenderedViews((count) => count + 1), []);
  const handleFieldSearch = useCallback((text) => {
    setSearchRequest((request) => ({ id: request.id + 1, text }));
    setSearchQuery(text);
    window.scrollTo({ top: 0 });
  }, []);
  // Picking new files while older ones are still being read must not let the old batch win.
  const latestPick = useRef(0);

  const handleFiles = async (picked) => {
    const pick = ++latestPick.current;
    setFiles(picked);
    const { loadSave } = await import('./lib/loadSave');
    const loaded = await Promise.all(picked.map(loadSave));
    if (pick !== latestPick.current) return;
    setSaves(loaded);
    setActiveFileName(loaded.find((save) => !save.error)?.fileName ?? null);
  };

  const readableSaves = useMemo(() => saves.filter((save) => !save.error), [saves]);
  const failedSaves = saves.filter((save) => save.error);
  const activeSave = readableSaves.find((save) => save.fileName === activeFileName);
  const canCompare = readableSaves.length > 1;
  const showsComparison = isComparing && canCompare;
  const isSearching = searchQuery.trim() !== '';
  const showsRows = showsComparison || isSearching;
  const rowSaves = useMemo(
    () => (showsComparison ? readableSaves : [activeSave].filter(Boolean)),
    [showsComparison, readableSaves, activeSave],
  );
  const shownSavemaps = useMemo(() => rowSaves.map((save) => save.savemap), [rowSaves]);
  const shownFileNames = rowSaves.map((save) => save.fileName);
  // The sidebar reads section headings from the page, so it restarts whenever they change.
  const navigationKey = [
    activeFileName,
    showsRows,
    showsComparison,
    searchQuery,
    isChangedOnly,
    renderedViews,
  ].join('|');

  return (
    <ToolShell
      title="Save Viewer"
      status="development"
      repo="save-viewer"
      size="xl"
      intro="PC save reader."
      navbar={
        activeSave && (({ closeNavbar }) => <SectionNav key={navigationKey} onPick={closeNavbar} />)
      }
    >
      <Stack gap="lg">
        <FileInput
          multiple
          clearable
          accept={SAVE_FILE_EXTENSION}
          label="Save files"
          description="Steam: Documents\Square Enix\FINAL FANTASY VIII Steam\user_<id>\slotN_saveNN.ff8"
          placeholder="Choose .ff8 files"
          leftSection={<IconFileUpload size="1rem" />}
          value={files}
          onChange={handleFiles}
        />
        {failedSaves.map((save) => (
          <Alert key={save.fileName} color="red" title={save.fileName}>
            {save.error}
          </Alert>
        ))}
        {activeSave && (
          <ViewControls
            key={searchRequest.id}
            initialQuery={searchRequest.text}
            onSearch={setSearchQuery}
            canCompare={canCompare}
            isComparing={showsComparison}
            onComparingChange={setIsComparing}
            isChangedOnly={isChangedOnly}
            onChangedOnlyChange={setIsChangedOnly}
          />
        )}
        {canCompare && !showsComparison && (
          <SaveSwitcher
            fileNames={readableSaves.map((save) => save.fileName)}
            value={activeFileName}
            onChange={setActiveFileName}
          />
        )}
        <Suspense fallback={<Loader size="sm" />}>
          {showsRows && (
            <RowsView
              saves={rowSaves}
              query={searchQuery}
              isChangedOnly={showsComparison && isChangedOnly}
              onRendered={handleViewRendered}
            />
          )}
          {!showsRows && activeSave && (
            <SaveView save={activeSave} onRendered={handleViewRendered} />
          )}
          {!isSearching && activeSave && (
            <HexViewSection
              savemaps={shownSavemaps}
              fileNames={shownFileNames}
              onFieldSearch={handleFieldSearch}
              isChangedOnly={showsComparison && isChangedOnly}
              onRendered={handleViewRendered}
            />
          )}
        </Suspense>
      </Stack>
    </ToolShell>
  );
}
