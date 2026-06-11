// src/__tests__/store.test.ts
import { useStore } from '../../src/store/useStore';
import { supabase } from '../../src/lib/supabase';

jest.mock('../../src/lib/supabase', () => ({
  from: () => ({
    upsert: jest.fn().mockResolvedValue({ data: [], error: null })
  })
}));

describe('useStore actions', () => {
  beforeEach(() => {
    const { set } = useStore.getState();
    // reset store state if needed
    set((state: any) => ({
      rows: [],
      notifications: []
    }));
  });

  it('adds a row and creates a notification', async () => {
    const { addRow, rows, notifications } = useStore.getState();
    await addRow({
      testPoint: 'Test A',
      moduleName: 'Module X',
      url: 'https://example.com',
      howToTest: 'Do something',
      expectedResult: 'Result',
      actualResult: '',
      functionalityStatus: 'Pending',
      testingStatus: 'Pending',
      priority: 'Medium',
      assignedUser: undefined,
      customFields: {}
    } as any);
    const state = useStore.getState();
    expect(state.rows.length).toBe(1);
    expect(state.notifications.length).toBeGreaterThan(0);
    expect(state.notifications[0].message).toMatch(/New Test Point assigned/);
  });
});
