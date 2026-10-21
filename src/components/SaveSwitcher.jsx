import { SegmentedControl, Select } from '@mantine/core';
import { MAX_SEGMENTED_SAVES } from '../constants';

// Tabs for a few saves; past that they'd be clipped off-screen, so a dropdown.
export default function SaveSwitcher({ fileNames, value, onChange }) {
  if (fileNames.length <= MAX_SEGMENTED_SAVES) {
    return <SegmentedControl value={value} onChange={onChange} data={fileNames} />;
  }

  return (
    <Select
      label="Save shown"
      data={fileNames}
      value={value}
      onChange={onChange}
      allowDeselect={false}
      searchable
      maxDropdownHeight={320}
    />
  );
}
