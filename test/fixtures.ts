/** 一条期望：只断言我们关心的字段（其余忽略）。 */
export interface Fixture {
  input: string;
  expect: Partial<{
    provinceName: string;
    provinceCode: string;
    cityName: string;
    cityCode: string;
    districtName: string;
    town: string;
    detail: string;
    name: string;
    mobile: string;
    phone: string;
    idCard: string;
    zipcode: string;
  }>;
}

export const FIXTURES: Fixture[] = [
  {
    input: '张三 13812345678 浙江省杭州市余杭区五常街道文一西路969号',
    expect: {
      provinceName: '浙江省',
      provinceCode: '330000',
      cityName: '杭州市',
      cityCode: '330100',
      districtName: '余杭区',
      town: '五常街道',
      detail: '文一西路969号',
      name: '张三',
      mobile: '13812345678',
    },
  },
  {
    input: '北京朝阳区三里屯街道工体北路8号',
    expect: {
      provinceName: '北京市',
      provinceCode: '110000',
      cityName: '北京市',
      cityCode: '110100',
      districtName: '朝阳区',
      town: '三里屯街道',
      detail: '工体北路8号',
    },
  },
  {
    input: '上海市浦东新区世纪大道100号',
    expect: {
      provinceName: '上海市',
      cityName: '上海市',
      districtName: '浦东新区',
      detail: '世纪大道100号',
    },
  },
  {
    input: '重庆渝北区龙溪街道新南路123号',
    expect: {
      provinceName: '重庆市',
      cityName: '重庆市',
      districtName: '渝北区',
      town: '龙溪街道',
      detail: '新南路123号',
    },
  },
  // 由「市」反推「省」
  {
    input: '杭州市西湖区文三路478号',
    expect: {
      provinceName: '浙江省',
      cityName: '杭州市',
      districtName: '西湖区',
      detail: '文三路478号',
    },
  },
  {
    input: '苏州市姑苏区干将东路',
    expect: {
      provinceName: '江苏省',
      cityName: '苏州市',
      districtName: '姑苏区',
    },
  },
  // 省份简称
  {
    input: '广东深圳南山区科技园',
    expect: {
      provinceName: '广东省',
      cityName: '深圳市',
      districtName: '南山区',
    },
  },
  // 省份后直接县级市（跳过地级市）
  {
    input: '浙江省义乌市北苑街道',
    expect: {
      provinceName: '浙江省',
      districtName: '义乌市',
      town: '北苑街道',
    },
  },
  // 自治区 + 简称
  {
    input: '广西南宁市青秀区民族大道',
    expect: {
      provinceName: '广西壮族自治区',
      cityName: '南宁市',
      districtName: '青秀区',
    },
  },
  {
    input: '内蒙古呼和浩特市新城区',
    expect: {
      provinceName: '内蒙古自治区',
      cityName: '呼和浩特市',
      districtName: '新城区',
    },
  },
  // 自治州
  {
    input: '湖北省恩施土家族苗族自治州利川市',
    expect: {
      provinceName: '湖北省',
      cityName: '恩施土家族苗族自治州',
      districtName: '利川市',
    },
  },
  // 收件人 + 邮编
  {
    input: '收件人：王小明 13900139000 福建省厦门市思明区软件园二期 361008',
    expect: {
      provinceName: '福建省',
      cityName: '厦门市',
      districtName: '思明区',
      name: '王小明',
      mobile: '13900139000',
      zipcode: '361008',
    },
  },
  // 末尾姓名
  {
    input: '上海市浦东新区张江镇科苑路88号 李雷',
    expect: {
      provinceName: '上海市',
      town: '张江镇',
      detail: '科苑路88号',
      name: '李雷',
    },
  },
  // 手机号带分隔符 + 身份证
  {
    input: '河南省郑州市金水区花园路1号 138-1234-5678',
    expect: {
      provinceName: '河南省',
      cityName: '郑州市',
      districtName: '金水区',
      mobile: '13812345678',
    },
  },
  // 固定电话
  {
    input: '广东省广州市天河区天河路385号 020-38888888',
    expect: {
      provinceName: '广东省',
      cityName: '广州市',
      districtName: '天河区',
      phone: '020-38888888',
    },
  },
  // 复姓
  {
    input: '欧阳娜娜 13700137000 四川省成都市武侯区天府大道',
    expect: {
      provinceName: '四川省',
      cityName: '成都市',
      districtName: '武侯区',
      name: '欧阳娜娜',
    },
  },
];
