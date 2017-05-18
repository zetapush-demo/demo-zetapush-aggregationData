import { RealtimeDataPage } from './app.po';

describe('realtime-data App', () => {
  let page: RealtimeDataPage;

  beforeEach(() => {
    page = new RealtimeDataPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
