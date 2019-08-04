import * as React from 'react';
import { Text, View, Dimensions, PanResponder, Animated, Image } from 'react-native';
import Constants from 'expo-constants';

import og from './assets/og.jpg';
import img01 from './assets/01_3x3.jpg';
import img02 from './assets/02_3x3.jpg';
import img03 from './assets/03_3x3.jpg';
import img11 from './assets/11_3x3.jpg';
import img12 from './assets/12_3x3.jpg';
import img13 from './assets/13_3x3.jpg';
import img21 from './assets/21_3x3.jpg';
import img22 from './assets/22_3x3.jpg';
import img23 from './assets/23_3x3.jpg';
const images = [[null,img01,img02,img03],[null,img11,img12,img13],[null,img21,img22,img23]];

const width = Dimensions.get('window').width-16;
class Box extends React.Component{
  constructor(props){
    super(props);
    this.top = new Animated.Value(this.props.pos.y);
    this.left = new Animated.Value(this.props.pos.x);
    this.x = this.props.pos.x;
    this.y = this.props.pos.y;
    this.move = (left, top, duration) => {
      this.x = left;
      this.y = top;
      Animated.timing(this.top, {
        toValue:top,
        duration
      }).start();
      Animated.timing(this.left, {
        toValue:left,
        duration
      }).start();
    }
    this.props.abc({
      og:[this.props.pos.x, this.props.pos.y],
      move:this.move,
      hidden:this.props.hidden,
      x:() => this.x,
      y:() => this.y
    });

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => !this.props.hidden,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => !this.props.hidden,
      onMoveShouldSetPanResponder: (evt, gestureState) => !this.props.hidden,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => !this.props.hidden,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        this.touchState = 'touch'
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        this.touchState = 'move'
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        // if(this.touchState === 'touch'){
          this.props.pressed();
          // this.move(1, 3)
        // }
        this.touchState = 'done'
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        this.touchState = 'done'
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }
  render() {
    const top = this.top.interpolate({
      inputRange: [0, 2],
      outputRange: [0, 2*width/3]
    })
    const left = this.left.interpolate({
      inputRange: [0, 2],
      outputRange: [0, 2*width/3]
    })
    const imgPath = "./assets/22_3x3.jpg";
    // try{
    return (
      <Animated.View {...this._panResponder.panHandlers} style={{position:'absolute',width:width/3,height:width/3,padding:width/200,top,left}}>
        <View style={{backgroundColor:this.props.hidden?'#0920':'#eee', flex:1}}>
          {this.props.hidden?null:<Image source={images[this.props.pos.x][this.props.pos.y]} style={{height:width/3-width/200,width:width/3-width/200}} />}
        </View>
      </Animated.View>
    );
    // } catch(error) {console.log(images[this.props.pos.x][this.props.pos.y]);return <Animated.View {...this._panResponder.panHandlers} style={{position:'absolute',width:width/3,height:width/3,padding:width/100,top,left}}><View style={{backgroundColor:this.props.hidden?'#0920':'#eee', flex:1}}/></Animated.View>;}
  }
}

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {empty:[0,0]};
    this.boxThere = [[null,null,null,null],[null,null,null,null],[null,null,null,null]];
    this.boxDefault = [[null,null,null,null],[null,null,null,null],[null,null,null,null]];
  }
  isSolved = () => {
    for(var x = 0;x<3;x++){
      for(var y = 0; y<4;y++){
        
        if(this.boxThere[x][y]?(x!=this.boxThere[x][y].og[0] || y!=this.boxThere[x][y].og[1]):false) return false;
      }
    }
    return true;
  }
  swap2 = (i1, i2) => {
    this.boxThere[i1[0]][i1[1]].move(i2[0],i2[1],100);
    this.boxThere[i2[0]][i2[1]].move(i1[0],i1[1],100);
    const toSwap = this.boxThere[i1[0]][i1[1]];
    this.boxThere[i1[0]][i1[1]] = this.boxThere[i2[0]][i2[1]]
    this.boxThere[i2[0]][i2[1]] = toSwap;
  }
  moveAsGiven = order => {
    var i = 0;
    var interval = setInterval(() => {
      this.swap2(this.state.empty, order[i]);
      this.setState({empty:order[i]});
      i++;
      if(i===order.length) clearInterval(interval);
    }, 110);
  };
  pressedBox = item => {
    const thisItem = this.boxDefault[item[0]][item[1]];
    const x = thisItem.x();
    const y = thisItem.y();
    // console.log("Differences: ", Math.abs(this.state.empty[0]-x),Math.abs(this.state.empty[1]-y));
    if(Math.abs(this.state.empty[0]-x)===1 && Math.abs(this.state.empty[1]-y)===0){
      this.swap2(this.state.empty, [x, y])
      this.setState({empty:[x,y]})
      // console.log("Move x", this.boxThere);
    } else if(Math.abs(this.state.empty[1]-y)===1 && Math.abs(this.state.empty[0]-x)===0){
      this.swap2(this.state.empty, [x, y])
      this.setState({empty:[x,y]})
    } else if(Math.abs(this.state.empty[1]-y)===2 && Math.abs(this.state.empty[0]-x)===0){
      this.swap2(this.state.empty, [x, y+(this.state.empty[1]-y<0?-1:1)])
      this.setState({empty:[x,y+(this.state.empty[1]-y<0?-1:1)]})
      setTimeout(() => {this.swap2(this.state.empty, [x, y]);this.setState({empty:[x, y]})}, 101)
    }else if(Math.abs(this.state.empty[0]-x)===2 && Math.abs(this.state.empty[1]-y)===0){
      this.swap2(this.state.empty, [x+(this.state.empty[0]-x<0?-1:1), y])
      this.setState({empty:[x+(this.state.empty[0]-x<0?-1:1),y]})
      setTimeout(() => {this.swap2(this.state.empty, [x, y]);this.setState({empty:[x, y]})}, 101)
    } else if(Math.abs(this.state.empty[1]-y)===3 && Math.abs(this.state.empty[0]-x)===0){
      this.swap2(this.state.empty, [x, y+(this.state.empty[1]-y<0?-2:2)])
      this.setState({empty:[x,y+(this.state.empty[1]-y<0?-2:2)]})
      setTimeout(() => {
        this.swap2(this.state.empty, [x, y+(this.state.empty[1]-y<0?-1:1)]);
        this.setState({empty:[x, y+(this.state.empty[1]-y<0?-1:1)]});
        setTimeout(() => {
          this.swap2(this.state.empty, [x, y]);
          this.setState({empty:[x, y]});
        }, 101)
      }, 101)
    }
  };
  reset = () => {
    this.boxDefault.forEach(columns => columns.forEach(item => {
      // console.log(item);
      if(item) item.move(item.og[0], item.og[1], 10);
    }))
    this.boxThere = this.boxDefault;
    this.setState({empty:[0,0]})
  };
  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', paddingTop: Constants.statusBarHeight, backgroundColor: this.isSolved()?'#dfd':'#fdd', padding: 8,}}>
        <View style={{width,height:width*4/3, backgroundColor:this.isSolved()?'#8a8':'#a88'}}>
          {[[0,0],[0,1],[0,2],[0,3],[1,1],[1,2],[1,3],[2,1],[2,2],[2,3]].map(item =>
            item[0]===0&&item[1]===0?
              <Box pos={{x:item[0],y:item[1]}} abc={ref => {
                this.boxThere[item[0]][item[1]] = ref;
                this.boxDefault[item[0]][item[1]] = ref
              }} hidden />:
              <Box pos={{x:item[0],y:item[1]}} abc={ref => {
                this.boxThere[item[0]][item[1]] = ref;
                this.boxDefault[item[0]][item[1]] = ref
              }} empty={this.state.empty} pressed={() => this.pressedBox(item)} />
          )}
          <View style={{width:width*2/3, height:width/3, position:'absolute', top:0, right:0, backgroundColor:this.isSolved()?'#dfd':'#fdd', alignItems:'center', justifyContent:'center', flexDirection:'row'}}>
            <Image style={{height:width*6/20, width:width*6/20}} source={og} />
          </View>
        </View>
        <View style={{flexDirection:'row', padding:10}}>
          <Text style={{color:'#008', fontSize:20}} onPress={() => this.moveAsGiven([[0,1],[0,2],[1,2],[1,3],[2,3],[2,2],[2,1]])}>Mix</Text>
          <View style={{flex:1}} />
          <Text style={{color:'#008', fontSize:20}} onPress={this.reset}>Reset</Text>
        </View>
      </View>
    );
  }
}