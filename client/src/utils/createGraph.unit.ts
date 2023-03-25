import { getWidthAndHeight } from "./createGraph";

/**
 * @group unit
 */
describe("createGraph", () => {

  it("should parse simple full tree", () => {
    const simpleGraph = {
      "1": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "2"},
          {prompt: "", next: "3"}
        ]
      },
      "2": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "4"},
          {prompt: "", next: "5"}
        ]
      },
      "3": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "6"},
          {prompt: "", next: "7"}
        ]
      },
      "4": {
        name: "",
        resources: [],
        links: []
      },
      "5": {
        name: "",
        resources: [],
        links: []
      },
      "6": {
        name: "",
        resources: [],
        links: []
      },
      "7": {
        name: "",
        resources: [],
        links: []
      }
    }
    const response = getWidthAndHeight("1", simpleGraph)
    expect(response).toEqual([["1"],["2", "3"], ["4","5","6","7"]]);
  });

  it("should remove duplicates", () => {
    const duplicateGraph = {
      "1": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "2"},
          {prompt: "", next: "3"}
        ]
      },
      "2": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "4"},
          {prompt: "", next: "5"}
        ]
      },
      "3": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "5"},
          {prompt: "", next: "6"}
        ]
      },
      "4": {
        name: "",
        resources: [],
        links: []
      },
      "5": {
        name: "",
        resources: [],
        links: []
      },
      "6": {
        name: "",
        resources: [],
        links: []
      },
    }

    const response = getWidthAndHeight("1", duplicateGraph)
    expect(response).toEqual([["1"],["2", "3"], ["4","5","6"]]);
  });

  it("should keep nodes with duplicates as low as possible", () => {
    const duplicateLowGraph = {
      "1": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "2"},
          {prompt: "", next: "3"}
        ]
      },
      "2": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "4"},
          {prompt: "", next: "5"}
        ]
      },
      "3": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "6"},
          {prompt: "", next: "7"}
        ]
      },
      "4": {
        name: "",
        resources: [],
        links: []
      },
      "5": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "7"},
        ]
      },
      "6": {
        name: "",
        resources: [],
        links: []
      },
      "7": {
        name: "",
        resources: [],
        links: []
      },
    }
    const response = getWidthAndHeight("1", duplicateLowGraph)
    expect(response).toEqual([["1"],["2", "3"], ["4","5","6"],["7"]]);
  });

  it("should throw an error when graph has a cycle", () => {
    const duplicateLowGraph = {
      "1": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "2"},
          {prompt: "", next: "3"}
        ]
      },
      "2": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "4"},
          {prompt: "", next: "5"}
        ]
      },
      "3": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "6"},
          {prompt: "", next: "7"}
        ]
      },
      "4": {
        name: "",
        resources: [],
        links: []
      },
      "5": {
        name: "",
        resources: [],
        links: [
          {prompt: "", next: "7"},
        ]
      },
      "6": {
        name: "",
        resources: [],
        links: []
      },
      "7": {
        name: "",
        resources: [],
        links: []
      },
    }
    const response = getWidthAndHeight("1", duplicateLowGraph)
    expect(response).toEqual([["1"],["2", "3"], ["4","5","6"],["7"]]);
  });
});