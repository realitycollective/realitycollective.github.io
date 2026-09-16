import MDXComponents from '@theme-original/MDXComponents';
import {DemoHosts, DemoLink, PlaygroundNote, PlaygroundTable} from '@site/src/components/DemoLinks';

// Components available in every markdown page without an import: the status-aware playground links.
export default {
  ...MDXComponents,
  DemoLink,
  DemoHosts,
  PlaygroundTable,
  PlaygroundNote,
};
