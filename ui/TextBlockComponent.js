import NodeComponent from './NodeComponent'
import TextProperty from './TextPropertyComponent'

export default class TextBlockComponent extends NodeComponent {
  render ($$) {
    let el = super.render($$)
    el.addClass('sc-text-block')

    let node = this.props.node
    // NOTE: we are not using the native text direction support as it changes the contenteditable behavior in a weird way
    // instead rtl text is supported on model level
    if (node.direction) {
      // el.attr('data-direction', node.direction)
      el.attr('dir', node.direction)
    }
    if (node.textAlign) {
      el.addClass('sm-align-' + node.textAlign)
    }
    el.append($$(TextProperty, {
      placeholder: this.props.placeholder,
      path: node.getPath(),
      direction: node.direction
    }))
    return el
  }
}
