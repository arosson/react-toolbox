import React from 'react';
import Slider from '../../components/slider';
import Input from '../../components/input';

class SliderTest extends React.Component {
  state = {
    slider2: 5,
    slider3: 1,
    slider4: [2, 8],
    slider5: [2, 3, 4, 5, 6, 7, 8, 9],
  };

  handleChange = (slider, value) => {
    this.setState({ ...this.state, [slider]: value });
  };

  render() {
    return (
      <section>
        <h5>Sliders</h5>
        <p>Normal slider</p>
        <Slider value={this.state.slider1} onChange={this.handleChange.bind(this, 'slider1')} />
        <p>With steps, initial value and editable</p>
        <Slider min={0} max={10} editable value={this.state.slider2} onChange={this.handleChange.bind(this, 'slider2')} />
        <p>Pinned and with snaps</p>
        <Slider pinned snaps min={0} max={10} step={2} editable value={this.state.slider3} onChange={this.handleChange.bind(this, 'slider3')} />
        <p>Disabled status</p>
        <Slider disabled pinned snaps min={0} max={10} step={2} editable value={this.state.slider3} onChange={this.handleChange.bind(this, 'slider3')} />
        <p>Two knob slider</p>
        <Slider min={0} max={10} editable value={this.state.slider4} onChange={this.handleChange.bind(this, 'slider4')} />
        <p>Multi knob slider</p>
        <Slider min={0} max={10} editable value={this.state.slider5} onChange={this.handleChange.bind(this, 'slider5')} />
      </section>
    );
  }
}

export default SliderTest;
