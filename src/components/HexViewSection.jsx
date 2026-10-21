import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Group, ScrollArea, Stack, Switch, Text } from '@mantine/core';
import { buildHexLines, BYTES_PER_LINE, COVERAGE, COVERAGE_COUNTS } from '../lib/coverage';
import { formatNumber, formatPercent } from '../lib/format';
import { isNavigationKey, moveSelection, resolveSelection } from '../lib/hexNavigation';
import { SAVEMAP_BYTES } from '../lib/saveFile';
import { HEX_BYTE_ID_PREFIX } from '../constants';
import HexByteInspector from './HexByteInspector';
import HexLine from './HexLine';
import SectionCard from './SectionCard';

const HEX_SECTION_ID = 'savemap-bytes';
const HEX_FONT_SIZE = 13;

// An ARIA grid: one Tab stop, and the arrow keys move the selection.
export default function HexViewSection({
  savemaps,
  fileNames,
  isChangedOnly,
  onFieldSearch,
  onRendered,
}) {
  useEffect(() => onRendered(), [onRendered]);
  const [isOpen, setIsOpen] = useState(false);
  const [isUnmappedOnly, setIsUnmappedOnly] = useState(false);
  const [chosenOffset, setChosenOffset] = useState(0);
  // Keyboard moves need focus to follow the selection once the new cell has rendered.
  const shouldFocusSelection = useRef(false);
  const lines = useMemo(() => buildHexLines(savemaps), [savemaps]);
  const isComparing = savemaps.length > 1;
  const showsLine = (line) => {
    if (isUnmappedOnly && !line.hasUnmapped) return false;
    if (isComparing && isChangedOnly && !line.hasChanges) return false;
    return true;
  };
  const visibleLines = lines.filter(showsLine);
  const selectedOffset = resolveSelection(visibleLines, chosenOffset);
  const selectedByte = visibleLines
    .flatMap((line) => line.bytes)
    .find((byte) => byte.offset === selectedOffset);
  const selectedLineOffset = selectedOffset - (selectedOffset % BYTES_PER_LINE);
  const mapped = COVERAGE_COUNTS[COVERAGE.mapped] ?? 0;

  useEffect(() => {
    if (!shouldFocusSelection.current) return;
    shouldFocusSelection.current = false;
    document.getElementById(`${HEX_BYTE_ID_PREFIX}${selectedOffset}`)?.focus();
  }, [selectedOffset]);

  const handleSelect = useCallback((offset) => setChosenOffset(offset), []);

  const handleKeyDown = (event) => {
    if (!isNavigationKey(event.key)) return;
    event.preventDefault();
    shouldFocusSelection.current = true;
    setChosenOffset(moveSelection(visibleLines, selectedOffset, event.key));
  };

  return (
    <SectionCard id={HEX_SECTION_ID} title="Savemap bytes">
      <Stack gap="sm">
        <Text size="sm">
          {formatNumber(mapped)} of {formatNumber(SAVEMAP_BYTES)} bytes mapped (
          {formatPercent(mapped / SAVEMAP_BYTES)}),{' '}
          {formatNumber(COVERAGE_COUNTS[COVERAGE.partial] ?? 0)} partly,{' '}
          <b>{formatNumber(COVERAGE_COUNTS[COVERAGE.unmapped] ?? 0)} unmapped</b>.
        </Text>
        <Text size="xs" c="dimmed">
          Bold: not in the memory map. Dotted: some bits mapped. Dim: mapped.
          {isComparing &&
            ' Highlighted and outlined: differs between the saves (the first save is shown).'}{' '}
          Click or tap a byte, or use the arrow keys, to see its offset, value and fields.
        </Text>
        <Group gap="md">
          <Button variant="default" size="xs" onClick={() => setIsOpen((open) => !open)}>
            {isOpen ? 'Hide bytes' : 'Show bytes'}
          </Button>
          {isOpen && (
            <Switch
              label="Lines with unmapped bytes only"
              checked={isUnmappedOnly}
              onChange={(event) => setIsUnmappedOnly(event.currentTarget.checked)}
            />
          )}
        </Group>
        {isOpen && selectedByte && (
          <HexByteInspector
            byte={selectedByte}
            fileNames={fileNames}
            onFieldSearch={onFieldSearch}
          />
        )}
        {isOpen && (
          <ScrollArea type="auto" offsetScrollbars>
            <Box
              role="grid"
              aria-label="Savemap bytes, 16 per line"
              ff="monospace"
              fz={HEX_FONT_SIZE}
              style={{ whiteSpace: 'pre' }}
              onKeyDown={handleKeyDown}
            >
              {visibleLines.map((line) => (
                <HexLine
                  key={line.offset}
                  line={line}
                  selectedOffset={line.offset === selectedLineOffset ? selectedOffset : null}
                  onSelect={handleSelect}
                />
              ))}
            </Box>
          </ScrollArea>
        )}
      </Stack>
    </SectionCard>
  );
}
