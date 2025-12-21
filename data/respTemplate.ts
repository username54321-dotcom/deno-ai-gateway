export interface RespTemp {
  auth: boolean;
  error: null | string;
  message: null | string;
  providor: null | string;
  tokens: null | number;
  model: null | string;
}

export let respTemp: RespTemp = {
  auth: false,
  error: null,
  message: null,
  providor: null,
  tokens: null,
  model: null,
};
