import { useQuery, useQueryClient } from '@tanstack/react-query'

import { branchService } from '@/services/branchService'

import { useOrganization } from '@/hooks/useOrganization'

import { Branch } from '@/types/branch'



const BRANCHES_CACHE_KEY = 'branches'

const CURRENT_BRANCH_CACHE_KEY = 'currentBranch'



export function useBranches() {

  const { organizationId } = useOrganization()

  const queryClient = useQueryClient()



  const branchesQuery = useQuery({

    queryKey: [BRANCHES_CACHE_KEY, organizationId],

    queryFn: async () => {

      const response = await branchService.getBranches(organizationId!)

      if (response.error) throw response.error

      return response.data || []

    },

    enabled: !!organizationId,

  })



  const currentBranchQuery = useQuery({

    queryKey: [CURRENT_BRANCH_CACHE_KEY],

    queryFn: () => {

      const saved = localStorage.getItem(CURRENT_BRANCH_CACHE_KEY)

      return saved ? JSON.parse(saved) : null

    },

    enabled: !branchesQuery.isLoading && !!branchesQuery.data?.length,

  })



  const setCurrentBranch = async (branch: Branch | null) => {

    if (branch) {

      localStorage.setItem(CURRENT_BRANCH_CACHE_KEY, JSON.stringify(branch))

    } else {

      localStorage.removeItem(CURRENT_BRANCH_CACHE_KEY)

    }

    await queryClient.setQueryData([CURRENT_BRANCH_CACHE_KEY], branch)

  }



  return {

    branches: branchesQuery.data || [],

    isLoading: branchesQuery.isLoading,

    isError: branchesQuery.isError,

    error: branchesQuery.error,

    currentBranch: currentBranchQuery.data,

    setCurrentBranch,

  }

} 






