import { SimpleGrid } from '@mantine/core';
import CharacterCard from './CharacterCard';

const GRID_COLUMNS = { base: 1, lg: 2 };

export default function CharactersSection({ characters }) {
  return (
    <SimpleGrid cols={GRID_COLUMNS} spacing="md">
      {characters.map((character) => (
        <CharacterCard key={character.name} character={character} />
      ))}
    </SimpleGrid>
  );
}
