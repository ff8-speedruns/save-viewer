import { useState } from 'react';
import { CloseButton, Group, Switch, TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { SEARCH_DEBOUNCE_MILLISECONDS } from '../constants';

export default function ViewControls({
  initialQuery = '',
  onSearch,
  canCompare,
  isComparing,
  onComparingChange,
  isChangedOnly,
  onChangedOnlyChange,
}) {
  // Typed text lives here so a keystroke re-renders only this box, not the page.
  const [query, setQuery] = useState(initialQuery);
  const searchAfterPause = useDebouncedCallback(onSearch, SEARCH_DEBOUNCE_MILLISECONDS);

  const handleChange = (event) => {
    setQuery(event.currentTarget.value);
    searchAfterPause(event.currentTarget.value);
  };

  const clearSearch = () => {
    searchAfterPause.cancel();
    setQuery('');
    onSearch('');
  };

  return (
    <Group gap="md" align="center" wrap="wrap">
      <TextInput
        flex="1 1 16rem"
        placeholder="Search every field: name, value or category"
        aria-label="Search fields"
        leftSection={<IconSearch size="1rem" />}
        rightSection={query && <CloseButton aria-label="Clear search" onClick={clearSearch} />}
        value={query}
        onChange={handleChange}
      />
      {canCompare && (
        <Switch
          label="Compare saves"
          checked={isComparing}
          onChange={(event) => onComparingChange(event.currentTarget.checked)}
        />
      )}
      {isComparing && (
        <Switch
          label="Changed only"
          checked={isChangedOnly}
          onChange={(event) => onChangedOnlyChange(event.currentTarget.checked)}
        />
      )}
    </Group>
  );
}
