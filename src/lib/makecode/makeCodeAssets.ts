import type { MakeCodeProject } from '@/types/makecode';

export const DEFAULT_MAKECODE_PROJECT: MakeCodeProject = {
  header: {
    id: '',
    name: 'Untitled',
    target: 'microbit',
    targetVersion: '6.0.0',
    meta: {},
  },
  text: {
    'main.ts': `basic.forever(function () {\n\n})\n`,
    'main.blocks': `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="pxt-on-start" id="on-start-block" x="0" y="0"></block>
  <block type="device_forever" id="forever-block" x="0" y="100"></block>
</xml>`,
    'pxt.json': JSON.stringify({
      name: 'Untitled',
      description: '',
      dependencies: {
        core: '*',
        radio: '*',
        microphone: '*',
      },
      files: ['main.blocks', 'main.ts'],
      preferredEditor: 'blocksprj',
    }, null, 2),
  },
};

export function buildMakeCodeUrl(options: {
  controllerId?: string;
  embed?: boolean;
} = {}): string {
  const params = new URLSearchParams();
  params.set('controller', '1');

  if (options.controllerId) {
    params.set('controllerId', options.controllerId);
  }
  if (options.embed) {
    params.set('embed', '1');
  }

  return `https://makecode.microbit.org/?${params.toString()}`;
}

export function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
