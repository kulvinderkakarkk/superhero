export const createSuperheroDB = /* GraphQL */ `
  mutation(
    $input: CreateSuperheroDBInput!
  ) {
    createSuperheroDB(input: $input) {
      id
      name
      powers {
        name
        label
      }
      backstory
    }
  }
`;

export const updateSuperheroDB = `
mutation(
  $input: UpdateSuperheroInput!
) {
  updateSuperheroDB(input: $input) {
    id
    name
    powers
    {
      name
      label
    }
    backstory
  }
}
`

export const deleteSuperheroDB = /* GraphQL */ `
  mutation(
    $input: DeleteSuperheroDBInput!
  ) {
    deleteSuperheroDB(input: $input) {
      id
      name
      powers
      {
        name
        label
      }
      backstory
    }
  }
`;

export const getAllSuperherosDB = /* GraphQL */ `
  query {
    getAllSuperherosDB {
      items
      {
        id
        name
        powers {
          name
          label
        }
        backstory
      }
    }
  }
`;

