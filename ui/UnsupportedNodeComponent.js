import Component from './Component'

export default class UnsupportedNodeComponent extends Component {
  render ($$) {
    return $$('pre')
      .addClass('content-node unsupported')
      .attr({
        'data-id': this.props.node.id,
        contentEditable: false
      })
      .append(
        JSON.stringify(this.props.node.properties, null, 2)
      )
  }
}
