# Taro 3 表单组件

适用于 Taro 3.x 的简单表单组件，不包含任何输入组件，只提供简单的表单布局/数据收集/联动/校验功能。**仅支持 React。**

# 特点

 - [x] 完全响应式。你说用户体验？用户体验有我开发体验重要吗。
 - [x] 强劲的动态表单支持，支持动态增删 Form.Item，暴打 @antmjs/vantui 的表单组件。
 - [x] 性能跟屎一样，但是我肯定不会爆炸。

# 安装

```bash
yarn add taro-form-react
```

# 使用

```tsx
import From from "taro-form-react";
// 样式只需要在入口文件引入一次
// 包含 Label 和一些简单布局样式
import "taro-form-react/dist/styles/index.scss";

import { Input, Button } from "@tarojs/components";

import type { FormActions } from "taro-form-react";

const Component = () => {
  const formRef = useRef<FormActions>();

  const handleSubmit = () => {
    formRef.current?.submit();
  }

  const handleReset = () => {
    formRef.current?.reset();
  }

  const handleFinish = (values) => {
    console.log(values);
  }

  const handleFinishedFailed = (errors) => {
    console.log(errors);
  }

  return (
    <Form
      // ref 用于触发表单校验、设置值、获取值等操作
      // 具体支持的操作可参考后续文档
      ref={formRef}
      // 丢弃值为 undefined 和 null 的字段
      // 默认为 true，如需保留请设置为 false
      omitNil={true}
      // 提交成功时触发
      onFinish={handleFinish}
      // 提交失败时触发（有表单元素校验失败）
      onFinishFailed={handleFinishedFailed}
    >
      {/* 表单元素示例 */}

      {/* 基础控件 */}
      <Form.Item 
        // Form.Item 必须存在 name 属性
        // 仅支持数组形式，如 ["field", "array" 0, "name"]
        name={["name"]}
        // Form.Item 应该劫持的输入事件，默认为 onChange
        trigger="onInput"
        // Form.Item 应该劫持的 value，默认为 value
        valuePropName="value"
        // 从事件中获取值的方法，默认为 (...args) => args[0]
        getValueFromEvent={e => e.detail.value}
      >
        {/* 必须存在单个子元素，不能是 React.Fragment */}
        {/* Form.Item 会劫持该元素的输入事件 */}
        <Input placeholder="请输入你的姓名" />
      </Form.Item>

      {/* 保留控件 */}
      {/* Form 不会保留不存在对应控件的值 */}
      {/* 即使你调用了 setFieldValue 设置了它 */}
      {/* 如果需要保留某些值，但不需要展示给用户编辑 */}
      {/* 可以使用 Form.Keep */}
      <Form.Keep
        fields={[
          ["field", "array", 0, "gender"],
          ["field", "array", 1, "gender"],
        ]}
      />

      {/* 上下文控件 */}
      {/* 用于实现复杂的表单联动 */}
      {/* 你可以在这个控件里完全操控表单的所有数据 */}
      {/* 且所有操作都是响应式的 */}
      <Form.Provider>
        {({
          data,
          setFieldValue,
        }) => {
          return (
            <>
              <Text>你好，{data.name}</Text>
              <Button
                onClick={() => {
                  setFieldValue(["name"], "");
                }}
              >
                清空姓名
              </Button>
            </>
          );
        }}
      </Form.Provider>
      <Button onClick={handleSubmit}>提交</Button>
      <Button onClick={handleReset}>重置</Button>
    </Form>
  )
}
```

# API

参考 TS 类型定义吧，以后再写。