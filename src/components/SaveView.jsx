import { useEffect } from 'react';
import { Stack } from '@mantine/core';
import { HAND_BUILT_SECTIONS } from '../constants';
import { FIELD_CATEGORY_SECTIONS } from '../lib/sections';
import CardRulesSection from './CardRulesSection';
import CardsSection from './CardsSection';
import CharactersSection from './CharactersSection';
import FieldCategorySection from './FieldCategorySection';
import GuardianForcesSection from './GuardianForcesSection';
import NameCountGrid from './NameCountGrid';
import SectionCard from './SectionCard';
import SummarySection from './SummarySection';

const SECTION_BODIES = {
  summary: ({ model }) => <SummarySection summary={model.summary} />,
  characters: ({ model }) => <CharactersSection characters={model.characters} />,
  'guardian-forces': ({ model }) => <GuardianForcesSection guardianForces={model.guardianForces} />,
  items: ({ model }) => <NameCountGrid entries={model.items} />,
  cards: ({ model }) => <CardsSection cards={model.cards} />,
  'card-rules': ({ cardRules }) => <CardRulesSection cardRules={cardRules} />,
};

export default function SaveView({ save, onRendered }) {
  useEffect(() => onRendered(), [onRendered]);

  return (
    <Stack gap="lg">
      {HAND_BUILT_SECTIONS.map((section) => (
        <SectionCard key={section.id} id={section.id} title={section.title}>
          {SECTION_BODIES[section.id](save)}
        </SectionCard>
      ))}
      {FIELD_CATEGORY_SECTIONS.map((section) => (
        <SectionCard key={section.id} id={section.id} title={section.title}>
          <FieldCategorySection fields={section.fields} savemap={save.savemap} />
        </SectionCard>
      ))}
    </Stack>
  );
}
