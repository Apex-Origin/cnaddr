import { describe, it, expect } from 'vitest';
import { parseCloud, createCloudParser, CloudError } from '../src/index.js';

/** 构造一个假的 fetch，返回指定 JSON 信封。 */
function fakeFetch(payload: unknown, capture?: (req: RequestInit) => void) {
  return ((_url: string, init?: RequestInit) => {
    capture?.(init ?? {});
    return Promise.resolve({
      status: 200,
      json: () => Promise.resolve(payload),
    } as Response);
  }) as typeof fetch;
}

describe('parseCloud · 云端增强（注入 fetch，无网络）', () => {
  it('归一化 address-parse 响应', async () => {
    const r = await parseCloud('浙江省杭州市余杭区文一西路969号', {
      fetch: fakeFetch({
        code: 0,
        msg: '成功',
        data: {
          province: '浙江省',
          city: '杭州市',
          district: '余杭区',
          street: '五常街道',
          detail: '文一西路969号',
          phone: '13812345678',
          name: '张三',
          zipcode: '311121',
        },
      }),
    });
    expect(r.source).toBe('address-parse');
    expect(r.province?.name).toBe('浙江省');
    expect(r.district?.name).toBe('余杭区');
    expect(r.town).toBe('五常街道');
    expect(r.mobile).toBe('13812345678');
    expect(r.name).toBe('张三');
    expect(r.zipcode).toBe('311121');
  });

  it('归一化 jd-address 四级 + ID', async () => {
    const r = await parseCloud('北京朝阳区三里屯街道工体北路8号', {
      endpoint: 'jd-address',
      fetch: fakeFetch({
        code: 0,
        data: {
          province: '北京',
          city: '北京市',
          county: '朝阳区',
          town: '三里屯街道',
          detail: '工体北路8号',
          province_id: 1,
          city_id: 72,
          county_id: 2818,
          town_id: 53124,
        },
      }),
    });
    expect(r.source).toBe('jd-address');
    expect(r.district?.name).toBe('朝阳区');
    expect(r.town).toBe('三里屯街道');
    expect(r.ids?.townId).toBe(53124);
  });

  it('携带 Authorization 头', async () => {
    let seen: RequestInit = {};
    await parseCloud('广东省深圳市', {
      apiKey: 'sk_live_demo',
      fetch: fakeFetch({ code: 0, data: { province: '广东省' } }, (i) => {
        seen = i;
      }),
    });
    const headers = seen.headers as Record<string, string>;
    expect(headers.authorization).toBe('Bearer sk_live_demo');
  });

  it('业务码非 0 抛 CloudError', async () => {
    await expect(
      parseCloud('x', {
        fetch: fakeFetch({ code: 4022, msg: 'insufficient_balance' }),
      }),
    ).rejects.toBeInstanceOf(CloudError);
  });

  it('createCloudParser 复用配置', async () => {
    const pro = createCloudParser({
      endpoint: 'jd-address',
      fetch: fakeFetch({ code: 0, data: { province: '上海', city: '上海市' } }),
    });
    const r = await pro('上海市浦东新区');
    expect(r.source).toBe('jd-address');
    expect(r.city?.name).toBe('上海市');
  });
});
