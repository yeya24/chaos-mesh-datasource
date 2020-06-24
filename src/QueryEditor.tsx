import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { InlineFormLabel, LegacyForms } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, ChaosEventsQuery } from './types';

const { Input, Select } = LegacyForms;

type Props = QueryEditorProps<DataSource, ChaosEventsQuery, MyDataSourceOptions>;

const kindOptions: Array<SelectableValue<string>> = [
  { value: 'PodChaos', label: 'Pod Chaos' },
  { value: 'NetworkChaos', label: 'Network Chaos' },
  { value: 'IOChaos', label: 'IO Chaos' },
  { value: 'TimeChaos', label: 'Time Chaos' },
  { value: 'KernelChaos', label: 'Kernel Chaos' },
  { value: 'StressChaos', label: 'Stress Chaos' },
];

interface State {
  namespaces: Array<SelectableValue<string>>;
}

export class QueryEditor extends PureComponent<Props, State> {
  query: ChaosEventsQuery;
  dataSource: DataSource;

  constructor(props: Props) {
    super(props);

    this.query = defaults(this.props.query, defaultQuery);
    this.dataSource = this.props.datasource;

    this.state = {
      namespaces: [],
    };
  }

  componentDidMount() {
    this.dataSource.queryNamespaces().then((results: any) => {
      this.setState({ namespaces: results.data.map((ns: string) => ({ label: ns, value: ns })) });
    });
  }

  onNamespaceChange = (item: SelectableValue<string>) => {
    this.query.namespace = item.value;
  };

  onKindChange = (item: SelectableValue<string>) => {
    this.query.kind = item.value!;
  };

  onExperimentChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.query.experiment = event.target.value;
  };

  onRunQuery = () => {
    const { query } = this;
    this.props.onChange(query);
    this.props.onRunQuery();
  };

  render() {
    const { namespaces } = this.state;
    const { experiment } = this.query;
    const selectedKind = kindOptions.find(o => o.value === this.query.kind);
    const selectedNamespace = namespaces.find(o => o.value === this.query.namespace);

    return (
      <div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <InlineFormLabel width={10} tooltip={'Namespace of the Chaos Experiment'}>
              Namespace
            </InlineFormLabel>
            <Select
              width={10}
              value={selectedNamespace}
              onChange={this.onNamespaceChange}
              onBlur={this.onRunQuery}
              options={namespaces}
              isSearchable={false}
            />
          </div>

          <div className="gf-form">
            <InlineFormLabel width={10} tooltip="Name of the Chaos Experiment">
              Experiment Name
            </InlineFormLabel>
            <Input
              type="text"
              className="gf-form-input"
              value={experiment}
              onChange={this.onExperimentChange}
              onBlur={this.onRunQuery}
            />
          </div>
        </div>

        <div className="gf-form">
          <InlineFormLabel width={8}>Chaos Kind</InlineFormLabel>
          <Select
            width={8}
            value={selectedKind}
            onChange={this.onKindChange}
            onBlur={this.onRunQuery}
            options={kindOptions}
            isSearchable={false}
          />
        </div>
      </div>
    );
  }
}
