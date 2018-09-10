import axios from 'axios';
import {
  observable, action, computed, toJS,
} from 'mobx';
import moment from 'moment';
import { store, stores } from 'choerodon-front-boot';
import { getCycles, getStatusList } from '../../../api/cycleApi';

const { AppState } = stores;

@store('TestPlanStore')
class TestPlanStore {
  @observable treeData = [
    {
      title: '所有版本',
      key: '0',
      children: [],
    },
  ]

  @observable expandedKeys = ['0'];

  @observable selectedKeys = [];

  @observable addingParent = null;

  @observable currentCycle = {};

  @observable statusList = [];

  @observable times = [];

  dataList = [];

  @observable loading = false;

  @computed get getTreeData() {
    return toJS(this.treeData);
  }

  @computed get getExpandedKeys() {
    return toJS(this.expandedKeys);
  }

  @computed get getSelectedKeys() {
    return toJS(this.selectedKeys);
  }

  @computed get getCurrentCycle() {
    return toJS(this.currentCycle);
  }

  getTree = () => new Promise((resolve) => {
    this.enterLoading();
    getStatusList('CYCLE_CASE').then((statusList) => {
      this.setStatusList({ statusList });
    });
    getCycles().then((data) => {
      this.setTreeData([{ title: '所有版本', key: '0', children: data.versions }]);
      
      this.generateList([
        { title: '所有版本', key: '0', children: data.versions },
      ]);
      resolve();
      // window.console.log(dataList);
    }).catch((err) => {
      Choerodon.prompt('网络错误');
    }).finally(() => {
      this.leaveLoading();
    });

    // 如果选中了项，就刷新table数据
    const currentCycle = this.getCurrentCycle;
    const selectedKeys = this.getSelectedKeys;
    if (currentCycle.cycleId) {
      this.loadCycle(selectedKeys, { node: { props: { data: currentCycle } } }, true);
    }
  })

  generateList = (data) => {
    // const temp = data;
    // while (temp) {
    //   dataList = dataList.concat(temp.children);
    //   if()
    // }
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      const { key, title } = node;
      // 找出url上的cycleId
      // const { cycleId } = getParams(window.location.href);
      // const currentCycle = TestPlanStore.getCurrentCycle;
      // if (!currentCycle.cycleId && Number(cycleId) === node.cycleId) {
      //   this.setExpandDefault(node);
      // } else if (currentCycle.cycleId === node.cycleId) {
      //   TestPlanStore.setCurrentCycle(node);
      // }
      this.dataList.push({ key, title });
      if (node.children) {
        this.generateList(node.children, node.key);
      }
    }
  }

  @action clearTimes=() => {
    this.times = [];
  }

  @action generateTimes = (data) => {
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      const {
        fromDate, toDate, title, type, 
      } = node;
      this.times.push({
        start: moment(fromDate), end: moment(toDate), title, type, 
      });
      if (node.children) {
        this.generateTimes(node.children);
      }
    }
  }

  @action setStatusList(statusList) {
    this.statusList = statusList;
  }

  @action enterLoading() {
    this.loading = true;
  }

  @action leaveLoading() {
    this.loading = false;
  }

  @action setExpandedKeys(expandedKeys) {
    // window.console.log(expandedKeys);
    this.expandedKeys = expandedKeys;
  }

  @action setSelectedKeys(selectedKeys) {
    this.selectedKeys = selectedKeys;
  }

  @action setTreeData(treeData) {
    this.treeData = treeData;
  }

  @action setCurrentCycle(currentCycle) {
    this.currentCycle = currentCycle;
  }

  @action removeAdding = () => {
    this.addingParent.children.shift();
    // this.setTreeData()
  }

  @action addItemByParentKey = (key, item) => {
    const arr = key.split('-');
    let temp = this.treeData;
    arr.forEach((index, i) => {
      // window.console.log(temp);
      if (i === 0) {
        temp = temp[index];
      } else {
        temp = temp.children[index];
      }
    });
    // 添加测试
    temp.children.unshift(item);
    this.addingParent = temp;
    // window.console.log({ ...item, ...{ key: `${key}-add'`, type: 'add' } });
  }
}

const testPlanStore = new TestPlanStore();
export default testPlanStore;
