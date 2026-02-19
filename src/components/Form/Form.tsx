import { FunctionComponent, FormEvent } from 'react';

import { Props } from './types';

const Form: FunctionComponent<Props> = ({ validate, submit, children }) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!validate || validate()) {
      submit();
    }
  };

  return <form onSubmit={handleSubmit}>{children}</form>;
};

export default Form;
