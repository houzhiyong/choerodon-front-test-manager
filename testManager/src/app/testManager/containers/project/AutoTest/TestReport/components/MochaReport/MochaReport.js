import React, { Component } from 'react';
import { Table, Icon } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import { observer } from 'mobx-react';
import moment from 'moment';
// import hljs from 'highlight.js/lib/highlight';
// import CodeSnippet from './CodeSnippet';
// import 'highlight.js/styles/solarized-light.css';
import { StatusTags } from '../../../../../../components/CommonComponent';
import ReportStore from './reportStore';
import DuringChart from './DuringChart';
// Register hljs languages
// hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
// hljs.registerLanguage('diff', require('highlight.js/lib/languages/diff'));

const STATUS = {
  passed: {
    name: '通过',
    code: 'success',
  },
  failed: {
    name: '失败',
    code: 'error',
  },
  slow: 'red',
  medium: '#fbc02d',
  fast: 'rgba(0,0,0,.38)',
};
const columns = [{
  title: '名称',
  dataIndex: 'title',
  key: 'title',
  render: (title, record) => {
    const { tests } = record;
    return (
      <span>
        {title}
        {tests && `（${tests.length}）`}
      </span>
    );
  },
}, {
  title: '状态',
  dataIndex: 'status',
  key: 'status',
  width: '12%',
  render: (status, record) => {
    const { tests } = record;
    // 父类型
    if (tests) {
      const {
        passes, failures,
      } = record;
      if (failures.length === 0) {
        return (
          <span>
            <StatusTags name="全部通过" colorCode="success" />
          </span>
        );
      } else if (failures.length > 0 && passes.length === 0) {
        return (
          <span>
            <StatusTags name="全不通过" colorCode="error" />
          </span>
        );
      } else {
        return (
          <span>
            <StatusTags name="部分通过" color="#4D90FE" />
          </span>
        );
      }
    } else {
      const { state } = record;
      // console.log(state);
      return (
        <span>
          <StatusTags name={STATUS[state].name} colorCode={STATUS[state].code} />
        </span>
      );
    }
  },
}, {
  title: '用时',
  dataIndex: 'duration',
  width: '30%',
  key: 'duration',
  render: (duration, record) => {
    const { durationdOut, timedOut, speed } = record;
    // slow medium fast
    return (
      <div>
        <span style={{ display: 'inline-block', width: 60 }}>
          {duration > 1000 ? `${duration / 1000}s` : `${duration}ms`}
        </span>     
        <Icon type="APItest" style={{ color: timedOut ? 'red' : STATUS[speed] || 'rgba(0,0,0,.38)' }} />
      </div>
    );
  },
}];

@observer
class MochaReport extends Component {
  componentDidMount() {
    ReportStore.updateFilteredSuites();
  }

  getOption() {
    const { stats } = ReportStore;
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b} : {c} ({d}%)',
      },
      
      series: [
        {
          color: ['red', '#00BFA5'],
          type: 'pie',
          radius: '80%',
          // radius: ['38px', '68px'],
          // avoidLabelOverlap: false,
          hoverAnimation: false,
          // legendHoverLink: false,
          // center: ['40%', '42%'],
          // label: {
          //   normal: {
          //     // show: false,
          //     // position: 'center',
          //     textStyle: {
          //       fontSize: '13',
          //     },
          //   },
          //   align: 'right',
          //   // emphasis: {
          //   //   show: false,
          //   // },
          // },
          data: [            
            { value: stats.failures, name: '失败数量' },
            { value: stats.passes, name: '成功数量' },
          ],
          itemStyle: {
            normal: {
              borderColor: '#FFFFFF', borderWidth: 1,
            },
          },
        },
      ],
    };
    return option;
  }

  render() {
    const tests = ReportStore.getFilteredTests;
    const { stats } = ReportStore;
    const {
      passPercent, skipped, duration, passes, failures, start, end, testsRegistered,
    } = stats;
    const { suites } = tests[0] || { suites: [] };
    console.log(ReportStore.getFilteredTests);
    const code = 'var cycleId = cloneCycle.cycleId;\nreturn cycleFunc.deleteCycle(cycleId);';
    return (
      <div>
        <div style={{ display: 'flex' }}>
        测试统计
          <ReactEcharts
            style={{ width: 500, flex: 1 }}
            option={this.getOption()}
          />
          <div style={{ width: 500, marginLeft: 50, boxShadow: '0 3px 1px -2px rgba(0,0,0,0.20), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12)' }}>
            <div>
              通过率:
              {passPercent}
              {' '}

            </div>
            <div>
            测试单元：
              {stats.suites}
            </div>
            <div>
            总测试数量:
              {
              testsRegistered
            }
            </div>
            <div>
            通过数量:
              {
              passes
            }
            </div>
            <div>
            失败数量:
              {
              failures
            }
            </div>
            <div>
            总耗时：
              {duration}
            </div>
            <div>
            开始时间:
              {moment(start).format('YYYY-MM-DD hh:mm:ss')}
            </div>
            <div>
            结束时间:
              {moment(end).format('YYYY-MM-DD hh:mm:ss')}
            </div>
          </div>
        </div>
        测试时长表
        <DuringChart />
        <Table
          columns={columns}
          dataSource={suites.map(suite => ({ ...suite, children: suite.tests }))}
        // expandedRowRender={record => <CodeSnippet className="code-snippet" code={record.code} />}
        />
        {/* <CodeSnippet className="code-snippet" code={code} label="Stack Trace" />
        <CodeSnippet className="code-snippet" code={'- 400\n+ 200\n'} lang="diff" label="Diff" /> */}
      </div>
    );
  }
}


export default MochaReport;
// atelier-estuary-light
// atom-one-light
// foundation
// magula
// mono-blue
// expandedRowRender={record => <p style={{ margin: 0 }}>{record.description}</p>
