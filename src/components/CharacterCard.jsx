import { Badge, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { formatNumber } from '../lib/format';
import BadgeList from './BadgeList';
import SummaryItem from './SummaryItem';

const STAT_COLUMNS = { base: 2, sm: 5 };

export default function CharacterCard({ character }) {
  const junctions = character.junctions.map((junction) => `${junction.slot}: ${junction.spell}`);
  const magic = character.magic.map((slot) => `${slot.spell} ×${slot.quantity}`);
  const statModifiers = character.statModifiers.map(
    (modifier) => `${modifier.stat} +${modifier.value}`,
  );
  const compatibility = character.compatibility.map((entry) => `${entry.name} ${entry.value}`);

  return (
    <Card withBorder padding="sm" bg="var(--mantine-color-default-hover)">
      <Stack gap="xs">
        <Group gap="xs">
          <Title order={4}>{character.name}</Title>
          {!character.isInRoster && (
            <Badge color="gray" variant="outline">
              Not in roster
            </Badge>
          )}
          {character.isKnockedOut && <Badge color="red">KO</Badge>}
          {character.isInSeedUniform && (
            <Badge color="blue" variant="outline">
              SeeD uniform
            </Badge>
          )}
        </Group>
        <SimpleGrid cols={STAT_COLUMNS} spacing="sm" verticalSpacing={4}>
          <SummaryItem label="Current HP">{formatNumber(character.currentHitPoints)}</SummaryItem>
          <SummaryItem label="EXP">{formatNumber(character.experience)}</SummaryItem>
          <SummaryItem label="Weapon">{character.weapon}</SummaryItem>
          <SummaryItem label="Kills">{character.kills}</SummaryItem>
          <SummaryItem label="KOs">{character.knockouts}</SummaryItem>
        </SimpleGrid>
        <Text size="xs" c="dimmed">
          Commands and abilities
        </Text>
        <BadgeList items={[...character.commands, ...character.abilities]} color="blue" />
        <Text size="xs" c="dimmed">
          Junctioned GFs
        </Text>
        <BadgeList items={character.junctionedGuardianForces} color="grape" />
        <Text size="xs" c="dimmed">
          Junctions
        </Text>
        <BadgeList items={junctions} color="teal" />
        <Text size="xs" c="dimmed">
          Stat modifiers (e.g. Str Up)
        </Text>
        <BadgeList items={statModifiers} color="orange" />
        <Text size="xs" c="dimmed">
          Magic
        </Text>
        <BadgeList items={magic} />
        <Text size="xs" c="dimmed">
          GF compatibility
        </Text>
        <BadgeList items={compatibility} color="grape" />
      </Stack>
    </Card>
  );
}
