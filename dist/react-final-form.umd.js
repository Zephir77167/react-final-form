;(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(
        exports,
        require('react'),
        require('prop-types'),
        require('final-form')
      )
    : typeof define === 'function' && define.amd
      ? define(['exports', 'react', 'prop-types', 'final-form'], factory)
      : factory(
          (global['react-final-form'] = {}),
          global.React,
          global.PropTypes,
          global.FinalForm
        )
})(this, function(exports, React, PropTypes, finalForm) {
  'use strict'

  PropTypes =
    PropTypes && PropTypes.hasOwnProperty('default')
      ? PropTypes['default']
      : PropTypes

  //
  function diffSubscription(a, b, keys) {
    if (a) {
      if (b) {
        // $FlowFixMe
        return keys.some(function(key) {
          return a[key] !== b[key]
        })
      } else {
        return true
      }
    } else {
      return !!b
    }
  }

  var _typeof =
    typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
      ? function(obj) {
          return typeof obj
        }
      : function(obj) {
          return obj &&
            typeof Symbol === 'function' &&
            obj.constructor === Symbol &&
            obj !== Symbol.prototype
            ? 'symbol'
            : typeof obj
        }

  var classCallCheck = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function')
    }
  }

  var createClass = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i]
        descriptor.enumerable = descriptor.enumerable || false
        descriptor.configurable = true
        if ('value' in descriptor) descriptor.writable = true
        Object.defineProperty(target, descriptor.key, descriptor)
      }
    }

    return function(Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps)
      if (staticProps) defineProperties(Constructor, staticProps)
      return Constructor
    }
  })()

  var _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key]
          }
        }
      }

      return target
    }

  var inherits = function(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
      throw new TypeError(
        'Super expression must either be null or a function, not ' +
          typeof superClass
      )
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    })
    if (superClass)
      Object.setPrototypeOf
        ? Object.setPrototypeOf(subClass, superClass)
        : (subClass.__proto__ = superClass)
  }

  var objectWithoutProperties = function(obj, keys) {
    var target = {}

    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue
      target[i] = obj[i]
    }

    return target
  }

  var possibleConstructorReturn = function(self, call) {
    if (!self) {
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called"
      )
    }

    return call && (typeof call === 'object' || typeof call === 'function')
      ? call
      : self
  }

  //

  // shared logic between components that use either render prop,
  // children render function, or component prop
  function renderComponent(props, name) {
    var render = props.render,
      children = props.children,
      component = props.component,
      rest = objectWithoutProperties(props, ['render', 'children', 'component'])

    if (component) {
      return React.createElement(
        component,
        _extends({}, rest, { children: children, render: render })
      )
    }
    if (render) {
      return render(_extends({}, rest, { children: children })) // inject children back in
    }
    if (typeof children !== 'function') {
      {
        console.error(
          'Warning: Must specify either a render prop, a render function as children, or a component prop to ' +
            name
        )
      }
      return null // warning will alert developer to their mistake
    }
    return children(rest)
  }

  //
  var isReactNative =
    typeof window !== 'undefined' &&
    window.navigator &&
    window.navigator.product &&
    window.navigator.product === 'ReactNative'

  //
  var getSelectedValues = function getSelectedValues(options) {
    var result = []
    if (options) {
      for (var index = 0; index < options.length; index++) {
        var option = options[index]
        if (option.selected) {
          result.push(option.value)
        }
      }
    }
    return result
  }

  var getValue = function getValue(
    event,
    currentValue,
    valueProp,
    isReactNative
  ) {
    if (
      !isReactNative &&
      event.nativeEvent &&
      event.nativeEvent.text !== undefined
    ) {
      return event.nativeEvent.text
    }
    if (isReactNative && event.nativeEvent) {
      return event.nativeEvent.text
    }
    var detypedEvent = event
    var _detypedEvent$target = detypedEvent.target,
      type = _detypedEvent$target.type,
      value = _detypedEvent$target.value,
      checked = _detypedEvent$target.checked

    switch (type) {
      case 'checkbox':
        if (valueProp !== undefined) {
          // we are maintaining an array, not just a boolean
          if (checked) {
            // add value to current array value
            return Array.isArray(currentValue)
              ? currentValue.concat(valueProp)
              : [valueProp]
          } else {
            // remove value from current array value
            if (!Array.isArray(currentValue)) {
              return currentValue
            }
            var index = currentValue.indexOf(valueProp)
            if (index < 0) {
              return currentValue
            } else {
              return currentValue
                .slice(0, index)
                .concat(currentValue.slice(index + 1))
            }
          }
        } else {
          // it's just a boolean
          return !!checked
        }
      case 'select-multiple':
        return getSelectedValues(event.target.options)
      default:
        return value
    }
  }

  //

  var all = finalForm.fieldSubscriptionItems.reduce(function(result, key) {
    result[key] = true
    return result
  }, {})

  var Field = (function(_React$Component) {
    inherits(Field, _React$Component)

    function Field(props, context) {
      classCallCheck(this, Field)

      var _this = possibleConstructorReturn(
        this,
        (Field.__proto__ || Object.getPrototypeOf(Field)).call(
          this,
          props,
          context
        )
      )

      _initialiseProps.call(_this)

      var initialState = void 0

      if ('development' !== 'production' && !context.reactFinalForm) {
        console.error(
          'Warning: Field must be used inside of a ReactFinalForm component'
        )
      }

      if (_this.context.reactFinalForm) {
        // avoid error, warning will alert developer to their mistake
        _this.subscribe(props, function(state) {
          if (initialState) {
            _this.notify(state)
          } else {
            initialState = state
          }
        })
      }
      _this.state = { state: initialState }
      return _this
    }

    createClass(Field, [
      {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          var name = nextProps.name,
            subscription = nextProps.subscription

          if (
            this.props.name !== name ||
            diffSubscription(
              this.props.subscription,
              subscription,
              finalForm.fieldSubscriptionItems
            )
          ) {
            if (this.context.reactFinalForm) {
              // avoid error, warning will alert developer to their mistake
              this.unsubscribe()
              this.subscribe(nextProps, this.notify)
            }
          }
        }
      },
      {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.unsubscribe()
        }
      },
      {
        key: 'render',
        value: function render() {
          var _props = this.props,
            allowNull = _props.allowNull,
            component = _props.component,
            children = _props.children,
            format = _props.format,
            parse = _props.parse,
            isEqual = _props.isEqual,
            name = _props.name,
            subscription = _props.subscription,
            validate = _props.validate,
            validateFields = _props.validateFields,
            _value = _props.value,
            rest = objectWithoutProperties(_props, [
              'allowNull',
              'component',
              'children',
              'format',
              'parse',
              'isEqual',
              'name',
              'subscription',
              'validate',
              'validateFields',
              'value'
            ])

          var _ref = this.state.state || {},
            blur = _ref.blur,
            change = _ref.change,
            focus = _ref.focus,
            value = _ref.value,
            ignoreName = _ref.name,
            meta = objectWithoutProperties(_ref, [
              'blur',
              'change',
              'focus',
              'value',
              'name'
            ])

          if (format) {
            value = format(value, name)
          }
          if (value === null && !allowNull) {
            value = ''
          }
          var input = _extends({ name: name, value: value }, this.handlers)
          if (rest.type === 'checkbox') {
            if (_value === undefined) {
              input.checked = !!value
            } else {
              input.checked = !!(Array.isArray(value) && ~value.indexOf(_value))
              input.value = _value
            }
          } else if (rest.type === 'radio') {
            input.checked = value === _value
            input.value = _value
          } else if (component === 'select' && rest.multiple) {
            input.value = input.value || []
          }

          if (typeof children === 'function') {
            return children(_extends({ input: input, meta: meta }, rest))
          }

          if (typeof component === 'string') {
            // ignore meta, combine input with any other props
            return React.createElement(
              component,
              _extends({}, input, { children: children }, rest)
            )
          }
          return renderComponent(
            _extends(
              {
                input: input,
                meta: meta,
                children: children,
                component: component
              },
              this.fieldActions,
              rest
            ),
            'Field(' + name + ')'
          )
        }
      }
    ])
    return Field
  })(React.Component)

  Field.contextTypes = {
    reactFinalForm: PropTypes.object
  }
  Field.defaultProps = {
    format: function format(value, name) {
      return value === undefined ? '' : value
    },
    parse: function parse(value, name) {
      return value === '' ? undefined : value
    }
  }

  var _initialiseProps = function _initialiseProps() {
    var _this2 = this

    this.subscribe = function(_ref2, listener) {
      var isEqual = _ref2.isEqual,
        name = _ref2.name,
        subscription = _ref2.subscription,
        validateFields = _ref2.validateFields

      _this2.unsubscribe = _this2.context.reactFinalForm.registerField(
        name,
        listener,
        subscription || all,
        {
          isEqual: isEqual,
          getValidator: function getValidator() {
            return _this2.props.validate
          },
          validateFields: validateFields
        }
      )
    }

    this.notify = function(state) {
      return _this2.setState({ state: state })
    }

    this.handlers = {
      onBlur: function onBlur(event) {
        _this2.state.state && _this2.state.state.blur()
      },
      onChange: function onChange(event) {
        var _props2 = _this2.props,
          parse = _props2.parse,
          _value = _props2.value

        if ('development' !== 'production' && event && event.target) {
          var targetType = event.target.type
          var props = _this2.props
          var unknown =
            ~['checkbox', 'radio', 'select-multiple'].indexOf(targetType) &&
            !props.type

          var type = targetType === 'select-multiple' ? 'select' : targetType

          var _ref3 =
              targetType === 'select-multiple'
                ? _this2.state.state || {}
                : props,
            _value2 = _ref3.value

          if (unknown) {
            console.error(
              'Warning: You must pass `type="' +
                type +
                '"` prop to your Field(' +
                props.name +
                ') component.\n' +
                ("Without it we don't know how to unpack your `value` prop - " +
                  (Array.isArray(_value2)
                    ? '[' + _value2 + ']'
                    : '"' + _value2 + '"') +
                  '.')
            )
          }
        }

        var value =
          event && event.target
            ? getValue(
                event,
                _this2.state.state && _this2.state.state.value,
                _value,
                isReactNative
              )
            : event
        _this2.state.state &&
          _this2.state.state.change(
            parse ? parse(value, _this2.props.name) : value
          )
      },
      onFocus: function onFocus(event) {
        _this2.state.state && _this2.state.state.focus()
      }
    }
    this.fieldActions = {
      blur: function blur() {
        if (_this2.context.reactFinalForm) {
          _this2.context.reactFinalForm.blur(_this2.props.name)
        }
      },
      change: function change(value) {
        if (_this2.context.reactFinalForm) {
          _this2.context.reactFinalForm.change(_this2.props.name, value)
        }
      },
      focus: function focus() {
        if (_this2.context.reactFinalForm) {
          _this2.context.reactFinalForm.focus(_this2.props.name)
        }
      },
      reset: function reset() {
        if (_this2.context.reactFinalForm) {
          _this2.context.reactFinalForm.change(
            _this2.props.name,
            _this2.state.state.initial
          )
        }
      }
    }
  }

  //
  var shallowEqual = function shallowEqual(a, b) {
    if (a === b) {
      return true
    }
    if (
      (typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== 'object' ||
      !a ||
      (typeof b === 'undefined' ? 'undefined' : _typeof(b)) !== 'object' ||
      !b
    ) {
      return false
    }
    var keysA = Object.keys(a)
    var keysB = Object.keys(b)
    if (keysA.length !== keysB.length) {
      return false
    }
    var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(b)
    for (var idx = 0; idx < keysA.length; idx++) {
      var key = keysA[idx]
      if (!bHasOwnProperty(key) || a[key] !== b[key]) {
        return false
      }
    }
    return true
  }

  //
  var version = '3.1.5'

  var versions = {
    'final-form': finalForm.version,
    'react-final-form': version
  }

  var all$1 = finalForm.formSubscriptionItems.reduce(function(result, key) {
    result[key] = true
    return result
  }, {})

  var ReactFinalForm = (function(_React$Component) {
    inherits(ReactFinalForm, _React$Component)

    function ReactFinalForm(props) {
      classCallCheck(this, ReactFinalForm)

      var _this = possibleConstructorReturn(
        this,
        (
          ReactFinalForm.__proto__ || Object.getPrototypeOf(ReactFinalForm)
        ).call(this, props)
      )

      _this.notify = function(state) {
        if (_this.mounted) {
          _this.setState({ state: state })
        }
        _this.mounted = true
      }

      _this.handleSubmit = function(event) {
        if (event && typeof event.preventDefault === 'function') {
          // sometimes not true, e.g. React Native
          event.preventDefault()
        }
        return _this.form.submit()
      }

      var debug = props.debug,
        decorators = props.decorators,
        initialValues = props.initialValues,
        mutators = props.mutators,
        onSubmit = props.onSubmit,
        subscription = props.subscription,
        validate = props.validate,
        validateOnBlur = props.validateOnBlur

      var config = {
        debug: debug,
        initialValues: initialValues,
        mutators: mutators,
        onSubmit: onSubmit,
        validate: validate,
        validateOnBlur: validateOnBlur
      }
      _this.mounted = false
      try {
        _this.form = finalForm.createForm(config)
      } catch (e) {
        {
          console.error('Warning: ' + e.message)
        }
      }
      _this.unsubscriptions = []
      if (_this.form) {
        // set initial state
        var initialState = {}
        _this.form.subscribe(function(state) {
          initialState = state
        }, subscription || all$1)()
        _this.state = { state: initialState }
      }
      if (decorators) {
        decorators.forEach(function(decorator) {
          _this.unsubscriptions.push(decorator(_this.form))
        })
      }
      return _this
    }

    createClass(ReactFinalForm, [
      {
        key: 'getChildContext',
        value: function getChildContext() {
          return {
            reactFinalForm: this.form
          }
        }
      },
      {
        key: 'componentWillMount',
        value: function componentWillMount() {
          if (this.form) {
            this.form.pauseValidation()
          }
        }
      },
      {
        key: 'componentDidMount',
        value: function componentDidMount() {
          if (this.form) {
            this.unsubscriptions.push(
              this.form.subscribe(this.notify, this.props.subscription || all$1)
            )
            this.form.resumeValidation()
          }
        }
      },
      {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          if (
            nextProps.initialValues &&
            !shallowEqual(this.props.initialValues, nextProps.initialValues)
          ) {
            this.form.initialize(nextProps.initialValues)
          }
        }
      },
      {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.unsubscriptions.forEach(function(unsubscribe) {
            return unsubscribe()
          })
        }
      },
      {
        key: 'render',
        value: function render() {
          // remove config props
          var _props = this.props,
            debug = _props.debug,
            initialValues = _props.initialValues,
            mutators = _props.mutators,
            onSubmit = _props.onSubmit,
            subscription = _props.subscription,
            validate = _props.validate,
            validateOnBlur = _props.validateOnBlur,
            props = objectWithoutProperties(_props, [
              'debug',
              'initialValues',
              'mutators',
              'onSubmit',
              'subscription',
              'validate',
              'validateOnBlur'
            ])

          return renderComponent(
            _extends({}, props, this.state ? this.state.state : {}, {
              mutators: this.form && this.form.mutators,
              batch: this.form && this.form.batch,
              blur: this.form && this.form.blur,
              change: this.form && this.form.change,
              focus: this.form && this.form.focus,
              handleSubmit: this.handleSubmit,
              initialize: this.form && this.form.initialize,
              reset: this.form && this.form.reset,
              __versions: versions
            }),
            'ReactFinalForm'
          )
        }
      }
    ])
    return ReactFinalForm
  })(React.Component)

  ReactFinalForm.childContextTypes = {
    reactFinalForm: PropTypes.object
  }
  ReactFinalForm.displayName =
    'ReactFinalForm(' + finalForm.version + ')(' + version + ')'

  //

  var FormSpy = (function(_React$Component) {
    inherits(FormSpy, _React$Component)

    function FormSpy(props, context) {
      classCallCheck(this, FormSpy)

      var _this = possibleConstructorReturn(
        this,
        (FormSpy.__proto__ || Object.getPrototypeOf(FormSpy)).call(
          this,
          props,
          context
        )
      )

      _this.subscribe = function(_ref, listener) {
        var subscription = _ref.subscription

        _this.unsubscribe = _this.context.reactFinalForm.subscribe(
          listener,
          subscription || all$1
        )
      }

      _this.notify = function(state) {
        _this.setState({ state: state })
        if (_this.props.onChange) {
          _this.props.onChange(state)
        }
      }

      var initialState = void 0

      if ('development' !== 'production' && !context.reactFinalForm) {
        console.error(
          'Warning: FormSpy must be used inside of a ReactFinalForm component'
        )
      }

      if (_this.context.reactFinalForm) {
        // avoid error, warning will alert developer to their mistake
        _this.subscribe(props, function(state) {
          if (initialState) {
            _this.notify(state)
          } else {
            initialState = state
            if (props.onChange) {
              props.onChange(state)
            }
          }
        })
      }
      if (initialState) {
        _this.state = { state: initialState }
      }
      return _this
    }

    createClass(FormSpy, [
      {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          var subscription = nextProps.subscription

          if (
            diffSubscription(
              this.props.subscription,
              subscription,
              finalForm.formSubscriptionItems
            )
          ) {
            if (this.context.reactFinalForm) {
              // avoid error, warning will alert developer to their mistake
              this.unsubscribe()
              this.subscribe(nextProps, this.notify)
            }
          }
        }
      },
      {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.unsubscribe()
        }
      },
      {
        key: 'render',
        value: function render() {
          var _props = this.props,
            onChange = _props.onChange,
            subscription = _props.subscription,
            rest = objectWithoutProperties(_props, ['onChange', 'subscription'])
          var reactFinalForm = this.context.reactFinalForm

          return onChange
            ? null
            : renderComponent(
                _extends({}, rest, this.state ? this.state.state : {}, {
                  mutators: reactFinalForm && reactFinalForm.mutators,
                  batch: reactFinalForm && reactFinalForm.batch,
                  blur: reactFinalForm && reactFinalForm.blur,
                  change: reactFinalForm && reactFinalForm.change,
                  focus: reactFinalForm && reactFinalForm.focus,
                  initialize: reactFinalForm && reactFinalForm.initialize,
                  reset: reactFinalForm && reactFinalForm.reset
                }),
                'FormSpy'
              )
        }
      }
    ])
    return FormSpy
  })(React.Component)

  FormSpy.contextTypes = {
    reactFinalForm: PropTypes.object
  }

  //

  exports.Field = Field
  exports.Form = ReactFinalForm
  exports.version = version
  exports.FormSpy = FormSpy

  Object.defineProperty(exports, '__esModule', { value: true })
})
//# sourceMappingURL=react-final-form.umd.js.map
