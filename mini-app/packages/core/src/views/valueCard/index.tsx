import { defineComponent } from 'vue'
import { useTabSearchTable } from '../../components/search-table'
import GrantRecord from './use-record'
import UseRecord from './grant-record'
import PhysicalCard from './physical-card'

export const CommonValueCard = defineComponent({
  name: '',
  props: {
    List: {}
  },
  setup(props) {
    const Table = useTabSearchTable([props.List, <GrantRecord />, <UseRecord />, <PhysicalCard />])

    return () => {
      return <div>{Table}</div>
    }
  }
})

export const CommonValueCardGrantRecord = () => import('./grant-record')
export const CommonValueCardUseRecord = () => import('./use-record')
export const CommonValueCardPhysicalCard = () => import('./physical-card')
