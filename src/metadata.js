class CardMetadata {
    card;
    groups;
    numHouses;
    name;

    constructor(data = {}) {
        Object.assign(this, data);
        this.card = this.card || 0;
        this.groups = this.groups || [];
        this.numHouses = this.numHouses || 0;
        this.name = this.name || '';
    }
}

class WorkerMetadata {
    name;

    constructor(data = {}) {
        Object.assign(this, data);
        this.name = this.name || '';
    }
}

export {CardMetadata, WorkerMetadata};
