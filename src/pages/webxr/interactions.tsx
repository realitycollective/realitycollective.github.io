import type {ReactNode} from 'react';
import FamilyOverview from '@site/src/components/FamilyOverview';
import {familyById} from '@site/src/data/families';

export default function Page(): ReactNode {
  return <FamilyOverview family={familyById('interactions')} />;
}
