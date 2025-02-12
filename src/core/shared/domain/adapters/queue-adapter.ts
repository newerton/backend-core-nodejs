export type QueueDataInput = {
  name: string;
  data: {
    [name: string]: string | number | null;
  };
};

export interface QueueAdapter {
  /**
   * Add a new item to the queue.
   * @param queueDataInput - Queue data to be added.
   * @returns ID of the item added to the queue.
   */
  add(queueDataInput: QueueDataInput): Promise<string>;
}
