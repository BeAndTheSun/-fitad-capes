import { formatGoogleAnalyticsData } from '@/client-common/utils/google-analytics';

describe('googleAnalytics', () => {
  it('should return undefined if is a get request', () => {
    const eventName = formatGoogleAnalyticsData('get', '../api/admin/test');
    expect(eventName).toBeUndefined();
  });

  it('should return undefined if dontSentToGA is true', () => {
    const eventName = formatGoogleAnalyticsData(
      'post',
      '../api/admin/test',
      'true'
    );
    expect(eventName).toBeUndefined();
  });

  it('should send a event to google analytics if dontSentToGA is false', () => {
    const eventName = formatGoogleAnalyticsData(
      'post',
      '../api/admin/test',
      'false'
    );
    expect(eventName).toEqual('admin_test');
  });

  it('should send a event to google analytics', () => {
    const eventName = formatGoogleAnalyticsData('post', '../api/admin/test');
    expect(eventName).toEqual('admin_test');
  });
});
